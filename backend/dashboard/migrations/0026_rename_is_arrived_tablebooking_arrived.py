# Generated by Django 5.1.7 on 2025-04-19 12:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0025_customerprofile_rfid_uid_tablebooking_is_arrived'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tablebooking',
            old_name='is_arrived',
            new_name='arrived',
        ),
    ]
