from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("unit_price",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "amount", "status", "stripe_session_id", "created_at")
    list_filter = ("status",)
    search_fields = ("email", "stripe_session_id")
    readonly_fields = ("stripe_session_id", "created_at")
    inlines = [OrderItemInline]
