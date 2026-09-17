from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "check_in_code",
        "event",
        "ticket_type",
        "buyer_name",
        "buyer_email",
        "status",
        "checked_in_at",
        "created_at",
    )
    list_filter = ("status", "event")
    search_fields = ("check_in_code", "buyer_name", "buyer_email", "paystack_reference")
    readonly_fields = ("check_in_code", "paystack_reference", "created_at")
