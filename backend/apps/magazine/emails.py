from django.conf import settings

from glitz_backend.operational_email import deliver, notify_operations
from .models import Order, OrderItem


def send_order_confirmation(order_id):
    order = Order.objects.prefetch_related("items__issue").get(pk=order_id)
    reference = order.payment_reference or str(order.pk)
    lines = [
        "Thank you for your Glitz Africa purchase.", "", f"Order reference: {reference}",
        f"Total: GHS {order.amount}", "", "Items:",
    ]
    has_digital = False
    for item in order.items.all():
        lines.append(f"- {item.issue.title} — {item.get_format_display()} x {item.quantity}")
        has_digital = has_digital or item.format == OrderItem.Format.DIGITAL
    if order.shipping_address:
        lines.extend(["", "Delivery address:", order.shipping_name, order.shipping_address])
    if has_digital:
        lines.extend(["", f"Sign in to access available digital editions: {settings.FRONTEND_BASE_URL.rstrip('/')}/account"])
    lines.extend(["", "If you need help, reply to this email."])
    customer_body = "\n".join(lines)
    deliver("Your Glitz Africa order is confirmed", customer_body, [order.email])

    staff_body = "\n".join([
        "A magazine order has been paid.", "", f"Order: {order.pk}",
        f"Reference: {reference}", f"Customer: {order.email}", f"Total: GHS {order.amount}",
        "", *lines[6:],
    ])
    notify_operations("Paid Glitz Africa magazine order", staff_body)

