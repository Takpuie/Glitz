from glitz_backend.branded_email import Email, button, code, details, note, para, send, table
from glitz_backend.operational_email import notify_operations
from .models import InstallmentPayment, PlanRegistration, Ticket

SHEBOSS_REPLY_TO = ["sheboss@glitzafrica.com"]

PLAN_IMPORTANT_INFO = (
    "International flights and accommodation are not included in the registration fee.\n"
    "Detailed retreat locations, itinerary and the dress-code lookbook will be shared after registration."
)
PLAN_CONTACT = (
    "Questions? Reply to this email, or contact sheboss@glitzafrica.com, "
    "+233 553 540 970 or +233 509 388 909."
)


def _money(currency, amount):
    return f"{currency} {amount:,.2f}"


def _first_name(name):
    return (name or "").split(" ")[0] or "there"


def _schedule_table(registration, today=None):
    currency = registration.plan.currency
    rows = []
    for row in registration.schedule(today):
        if row["paid"]:
            status, tone = "Paid", "ok"
        elif row["overdue"]:
            status, tone = "Overdue", "alert"
        else:
            status, tone = "Upcoming", "muted"
        rows.append({
            "cells": [row["label"], _money(currency, row["amount"]), f"{row['due_date']:%d %b %Y}", status],
            "tone": tone,
        })
    return table(["Payment", "Amount", "Due", "Status"], rows, title="Payment schedule")


def send_plan_payment_confirmation(payment_id):
    payment = InstallmentPayment.objects.select_related("registration").get(pk=payment_id)
    registration = PlanRegistration.objects.select_related("event", "plan").get(pk=payment.registration_id)
    currency = registration.plan.currency
    complete = registration.status == PlanRegistration.Status.COMPLETE
    event = registration.event

    rows = [
        ("Amount received", _money(currency, payment.amount)),
        ("Plan", registration.plan.name),
        ("Paid so far", f"{_money(currency, registration.amount_paid)} of {_money(currency, registration.plan.total)}"),
    ]
    if not complete:
        rows.append(("Balance", _money(currency, registration.balance)))
        nxt = registration.next_due()
        if nxt:
            rows.append(("Next payment", f"{_money(currency, registration.amount_due_now())} by {nxt['due_date']:%d %B %Y}"))
    rows.append(("Reference", payment.reference or str(payment.pk)))

    blocks = [
        para(f"Hello {_first_name(registration.name)}, we have received your payment for {event.name}."
             + (" You are paid in full and your place is confirmed. We can't wait to welcome you." if complete else "")),
        details(rows),
    ]
    if not complete:
        blocks += [
            _schedule_table(registration),
            para("Pay your next installment, or clear the full balance, from your private payment page:"),
            button("View your payment schedule", registration.manage_url),
        ]
    blocks += [note(PLAN_IMPORTANT_INFO, title="Important information"), para(PLAN_CONTACT, muted=True)]

    email = Email(
        subject=f"You're all set: {event.name}" if complete else f"Payment received: {event.name}",
        eyebrow=event.name,
        heading="You're all set." if complete else "Payment received.",
        preheader=f"We received {_money(currency, payment.amount)}."
                  + ("" if complete else f" Balance: {_money(currency, registration.balance)}."),
        blocks=blocks,
        reason=f"You're receiving this because you registered for {event.name}.",
    )
    send(email, [registration.email], reply_to=SHEBOSS_REPLY_TO)

    notify_operations(f"Plan payment received: {event.name}", Email(
        subject=f"Plan payment received: {event.name}",
        eyebrow="Team notification",
        heading="Plan payment received",
        blocks=[details([
            ("Registrant", registration.name),
            ("Email", registration.email),
            ("Phone", registration.phone),
            ("Plan", registration.plan.name),
            ("Payment", f"{_money(currency, payment.amount)} via {payment.get_provider_display()}"),
            ("Reference", payment.reference),
            ("Paid so far", _money(currency, registration.amount_paid)),
            ("Balance", _money(currency, registration.balance)),
            ("Status", registration.get_status_display()),
        ])],
        reason="Sent to the Glitz Africa operations team.",
    ))


def send_installment_reminder(registration, row, kind, today=None):
    currency = registration.plan.currency
    event = registration.event
    amount_now = registration.amount_due_now(today) if row["overdue"] else row["amount"]
    due = f"{row['due_date']:%d %B %Y}"
    if kind == "overdue":
        subject = f"Payment overdue: {event.name}"
        heading = "Your payment is overdue."
        opening = f"Your {row['label'].lower()} of {_money(currency, row['amount'])} was due on {due} and has not been received yet."
    else:
        subject = f"Payment reminder: {event.name}"
        heading = "Your next installment is due soon."
        opening = f"A friendly reminder that your {row['label'].lower()} of {_money(currency, row['amount'])} is due on {due}."

    email = Email(
        subject=subject,
        eyebrow=event.name,
        heading=heading,
        preheader=f"{_money(currency, amount_now)} due {due}.",
        blocks=[
            para(f"Hello {_first_name(registration.name)},"),
            para(opening),
            details([("Amount to pay now", _money(currency, amount_now)), ("Balance", _money(currency, registration.balance))]),
            button("Pay securely now", registration.manage_url),
            _schedule_table(registration, today),
            note(PLAN_IMPORTANT_INFO, title="Important information"),
            para(PLAN_CONTACT, muted=True),
        ],
        reason=f"You're receiving this because you registered for {event.name}.",
    )
    delivered = send(email, [registration.email], reply_to=SHEBOSS_REPLY_TO)
    if delivered and kind == "overdue":
        notify_operations(f"Overdue installment: {event.name}", Email(
            subject=f"Overdue installment: {event.name}",
            eyebrow="Team notification",
            heading="Installment overdue",
            blocks=[details([
                ("Registrant", registration.name),
                ("Email", registration.email),
                ("Phone", registration.phone),
                ("Installment", f"{row['label']}, {_money(currency, row['amount'])}"),
                ("Was due", due),
                ("Balance", _money(currency, registration.balance)),
            ])],
            reason="Sent to the Glitz Africa operations team.",
        ))
    return delivered


def send_ticket_confirmation(ticket_id):
    ticket = Ticket.objects.select_related("event", "ticket_type").get(pk=ticket_id)
    reference = ticket.paystack_reference or ticket.stripe_session_id or str(ticket.pk)
    event = ticket.event
    send(Email(
        subject=f"Your ticket for {event.name}",
        eyebrow=event.name,
        heading=f"You're in, {_first_name(ticket.buyer_name)}.",
        preheader=f"Your check-in code is {ticket.check_in_code}.",
        blocks=[
            para("Your Glitz Africa event ticket is confirmed. Bring this check-in code to the event."),
            code("Check-in code", ticket.check_in_code),
            details([
                ("Event", event.name),
                ("Date", f"{event.start_date:%d %B %Y}"),
                ("Venue", event.venue),
                ("Ticket", ticket.ticket_type.name),
                ("Amount", f"GHS {ticket.ticket_type.price:,.2f}"),
                ("Reference", reference),
            ]),
            para("If you need help, simply reply to this email.", muted=True),
        ],
        reason="You're receiving this because you bought a Glitz Africa event ticket.",
    ), [ticket.buyer_email])
    notify_operations("Paid Glitz Africa event ticket", Email(
        subject="Paid Glitz Africa event ticket",
        eyebrow="Team notification",
        heading="Event ticket paid",
        blocks=[details([
            ("Event", event.name),
            ("Ticket", ticket.ticket_type.name),
            ("Customer", f"{ticket.buyer_name} <{ticket.buyer_email}>"),
            ("Check-in code", ticket.check_in_code),
            ("Reference", reference),
        ])],
        reason="Sent to the Glitz Africa operations team.",
    ))
