from glitz_backend.operational_email import deliver, notify_operations
from .models import Ticket


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

