from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("magazine", "0004_alter_orderitem_order")]
    operations = [
        migrations.RenameField(model_name="order", old_name="stripe_session_id", new_name="payment_reference"),
        migrations.AddField(model_name="order", name="shipping_name", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="order", name="shipping_phone", field=models.CharField(blank=True, max_length=30)),
        migrations.AddField(model_name="order", name="shipping_address_line1", field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="order", name="shipping_address_line2", field=models.CharField(blank=True, max_length=200)),
        migrations.AddField(model_name="order", name="shipping_city", field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="order", name="shipping_region", field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name="order", name="shipping_postal_code", field=models.CharField(blank=True, max_length=30)),
        migrations.AddField(model_name="order", name="shipping_country", field=models.CharField(blank=True, default="GH", max_length=2)),
    ]
