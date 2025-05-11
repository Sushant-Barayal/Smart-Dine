from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('restaurant', 'Restaurant'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_approved = models.BooleanField(default=False)

    # Restaurant-specific fields
    restaurant_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    restaurant_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Save first to generate self.pk
        if self.role == 'restaurant' and not self.restaurant_id:
            self.restaurant_id = f"R-{self.pk}"
            super().save(update_fields=['restaurant_id'])  # Save again to update restaurant_id
