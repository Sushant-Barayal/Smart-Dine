# Generated by Django 5.1.7 on 2025-04-16 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0011_preorderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='tablebooking',
            name='preordered_items',
            field=models.ManyToManyField(blank=True, to='dashboard.menuitem'),
        ),
    ]
