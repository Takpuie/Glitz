from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extends Django's built-in user with the role this platform cares
    about. Wagtail's own staff/superuser flags still govern CMS access;
    this field is for the storefront/ticketing side — who owns orders and
    tickets, and who's allowed to manage them.
    """

    class Role(models.TextChoices):
        STAFF = "staff", "Staff"
        EDITOR = "editor", "Editor"
        CUSTOMER = "customer", "Customer"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    def __str__(self):
        return self.get_full_name() or self.username
