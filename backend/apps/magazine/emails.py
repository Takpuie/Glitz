from django.conf import settings

from glitz_backend.branded_email import Email, button, details, para, send, table
from glitz_backend.operational_email import notify_operations
from .models import Order, OrderItem


def send_order_confirmation(order_id):
    order = Order.objects.prefetch_related("items__issue").get(pk=order_id)
    reference = order.payment_reference or str(order.pk)
    items = list(order.items.all())
    has_digital = any(item.format == OrderItem.Format.DIGITAL for item in items)
    item_rows = [[item.issue.title, item.get_format_display(), str(item.quantity)] for item in items]

    blocks = [
        para("Thank you for your Glitz Africa purchase. Your order is confirmed."),
        details([("Order reference", reference), ("Total", f"GHS {order.amount:,.2f}")]),
        table(["Issue", "Format", "Qty"], item_rows, title="Your order"),
    ]
    if order.shipping_address:
        blocks.append(details([("Deliver to", f"{order.shipping_name}\n{order.shipping_address}")], title="Delivery"))
    if has_digital:
        blocks += [
            para("Your digital edition is ready. Sign in to your account to read or download it."),
            button("Read your digital edition", f"{settings.FRONTEND_BASE_URL.rstrip('/')}/account"),
        ]
    blocks.append(para("If you need help, simply reply to this email.", muted=True))

    send(Email(
        subject="Your Glitz Africa order is confirmed",
        eyebrow="Glitz Magazine",
        heading="Your order is confirmed.",
        preheader=f"Order {reference}: GHS {order.amount:,.2f}.",
        blocks=blocks,
        reason="You're receiving this because you placed an order with Glitz Africa.",
    ), [order.email])

    notify_operations("Paid Glitz Africa magazine order", Email(
        subject="Paid Glitz Africa magazine order",
        eyebrow="Team notification",
        heading="Magazine order paid",
        blocks=[
            details([
                ("Order", str(order.pk)),
                ("Reference", reference),
                ("Customer", order.email),
                ("Total", f"GHS {order.amount:,.2f}"),
                ("Deliver to", f"{order.shipping_name}\n{order.shipping_address}" if order.shipping_address else ""),
            ]),
            table(["Issue", "Format", "Qty"], item_rows),
        ],
        reason="Sent to the Glitz Africa operations team.",
    ))
