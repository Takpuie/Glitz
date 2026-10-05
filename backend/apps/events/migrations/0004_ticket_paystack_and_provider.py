from django.db import migrations, models


def drop_legacy_postgres_index(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute('DROP INDEX IF EXISTS "events_ticket_paystack_reference_1c48f6fc_like"')


class Migration(migrations.Migration):
    dependencies = [("events", "0003_rename_paystack_reference_ticket_stripe_session_id")]
    operations = [
        migrations.RunPython(drop_legacy_postgres_index, migrations.RunPython.noop),
        migrations.AddField(model_name="ticket", name="paystack_reference", field=models.CharField(blank=True, max_length=120, null=True, unique=True)),
        migrations.AddField(model_name="ticket", name="payment_provider", field=models.CharField(choices=[("stripe", "Stripe"), ("paystack", "Paystack")], default="stripe", max_length=10)),
    ]
