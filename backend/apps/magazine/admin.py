from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("unit_price",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "amount", "status", "paystack_reference", "created_at")
    list_filter = ("status",)
    search_fields = ("email", "paystack_reference")
    readonly_fields = ("paystack_reference", "created_at")
    inlines = [OrderItemInline]
