from glitz_backend.operational_email import deliver, notify_operations
from .models import InstallmentPayment, PlanRegistration, Ticket

PLAN_FOOTER = [
    "Important information:",
    "- International flights and accommodation are not included in the registration fee.",
    "- Detailed retreat locations, itinerary and the dress-code lookbook will be shared after registration.",
    "",
    "Questions? Reply to this email or contact sheboss@glitzafrica.com, +233 553 540 970 or +233 509 388 909.",
]


def _money(currency, amount):
    return f"{currency} {amount:,.2f}"


def _schedule_lines(registration, today=None):
    currency = registration.plan.currency
    lines = []
    for row in registration.schedule(today):
        state = "Paid" if row["paid"] else ("OVERDUE" if row["overdue"] else f"Due {row['due_date']:%d %B %Y}")
        lines.append(f"- {row['label']}: {_money(currency, row['amount'])} ({state})")
    return lines


def send_plan_payment_confirmation(payment_id):
    payment = InstallmentPayment.objects.select_related("registration").get(pk=payment_id)
    registration = PlanRegistration.objects.select_related("event", "plan").get(pk=payment.registration_id)
    currency = registration.plan.currency
    complete = registration.status == PlanRegistration.Status.COMPLETE
    lines = [
        f"Hello {registration.name},",
        "",
        f"We have received your payment of {_money(currency, payment.amount)} for {registration.event.name}.",
        "",
        f"Plan: {registration.plan.name}",
        f"Paid so far: {_money(currency, registration.amount_paid)} of {_money(currency, registration.plan.total)}",
    ]
    if complete:
        lines += ["", "You are paid in full. Your place is confirmed. We can't wait to welcome you."]
    else:
        nxt = registration.next_due()
        lines += [f"Balance: {_money(currency, registration.balance)}"]
        if nxt:
            lines += [f"Next payment: {_money(currency, registration.amount_due_now())} by {nxt['due_date']:%d %B %Y}"]
        lines += ["", "Payment schedule:", *_schedule_lines(registration), "",
                  "View your schedule and pay your next installment here:", registration.manage_url]
    lines += ["", f"Payment reference: {payment.reference or payment.pk}", "", *PLAN_FOOTER]
    subject = (
        f"You're all set: {registration.event.name}" if complete
        else f"Payment received: {registration.event.name}"
    )
    deliver(subject, "\n".join(lines), [registration.email])
    notify_operations(f"Plan payment received: {registration.event.name}", "\n".join([
        f"{registration.name} <{registration.email}> {registration.phone}",
        f"Plan: {registration.plan.name}",
        f"Payment: {_money(currency, payment.amount)} via {payment.get_provider_display()} ({payment.reference})",
        f"Paid so far: {_money(currency, registration.amount_paid)}; balance {_money(currency, registration.balance)}",
        f"Status: {registration.get_status_display()}",
    ]))


def send_installment_reminder(registration, row, kind, today=None):
    currency = registration.plan.currency
    amount = registration.amount_due_now(today) if row["overdue"] else row["amount"]
    if kind == "overdue":
        subject = f"Payment overdue: {registration.event.name}"
        opening = f"Your {row['label'].lower()} of {_money(currency, row['amount'])} was due on {row['due_date']:%d %B %Y} and is now overdue."
    else:
        subject = f"Payment reminder: {registration.event.name}"
        opening = f"A friendly reminder that your {row['label'].lower()} of {_money(currency, row['amount'])} is due on {row['due_date']:%d %B %Y}."
    body = [
        f"Hello {registration.name},", "", opening, "",
        f"Amount to pay now: {_money(currency, amount)}",
        f"Balance: {_money(currency, registration.balance)}", "",
        "Pay securely here:", registration.manage_url, "",
        "Payment schedule:", *_schedule_lines(registration, today), "", *PLAN_FOOTER,
    ]
    delivered = deliver(subject, "\n".join(body), [registration.email])
    if delivered and kind == "overdue":
        notify_operations(f"Overdue installment: {registration.event.name}", "\n".join([
            f"{registration.name} <{registration.email}> {registration.phone}",
            f"{row['label']} of {_money(currency, row['amount'])} was due {row['due_date']:%d %B %Y}.",
            f"Balance: {_money(currency, registration.balance)}",
        ]))
    return delivered


def send_ticket_confirmation(ticket_id):
    ticket = Ticket.objects.select_related("event", "ticket_type").get(pk=ticket_id)
    reference = ticket.paystack_reference or ticket.stripe_session_id or str(ticket.pk)
    customer_body = "\n".join([
        f"Hello {ticket.buyer_name},", "", "Your Glitz Africa event ticket is confirmed.", "",
        f"Event: {ticket.event.name}", f"Date: {ticket.event.start_date}",
        f"Ticket: {ticket.ticket_type.name}", f"Amount: GHS {ticket.ticket_type.price}",
        f"Check-in code: {ticket.check_in_code}", f"Payment reference: {reference}", "",
        "Bring this check-in code to the event. If you need help, reply to this email.",
    ])
    deliver(f"Your ticket for {ticket.event.name}", customer_body, [ticket.buyer_email])
    notify_operations("Paid Glitz Africa event ticket", "\n".join([
        "An event ticket has been paid.", "", f"Event: {ticket.event.name}",
        f"Ticket: {ticket.ticket_type.name}", f"Customer: {ticket.buyer_name} <{ticket.buyer_email}>",
        f"Check-in code: {ticket.check_in_code}", f"Reference: {reference}",
    ]))

