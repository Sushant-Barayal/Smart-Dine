from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model


class CustomerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="customer_profile")
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    food_preferences = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    customer_photo = models.ImageField(upload_to='customer_photos/', blank=True, null=True)
    rfid_uid = models.CharField(max_length=50, unique=True, null=True, blank=True) 

    def __str__(self):
        return f"{self.user.username} - Profile"


class RestaurantDashboard(models.Model):
        user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
        restaurant_name = models.CharField(max_length=255)
        address = models.TextField()
        phone_number = models.CharField(max_length=20)
        location = models.CharField(max_length=255)
        additional_details = models.TextField(blank=True, null=True)
        photo = models.ImageField(upload_to='restaurant_photos/', blank=True, null=True)
        floor_plan = models.ImageField(upload_to='floor_plans/', null=True, blank=True)
        description = models.TextField(blank=True, null=True)
        map_location = models.URLField(max_length=1000, blank=True, null=True)  
        opening_time = models.TimeField(blank=True, null=True)
        closing_time = models.TimeField(blank=True, null=True)
        gallery1 = models.ImageField(upload_to='restaurant_gallery/', blank=True, null=True)
        gallery2 = models.ImageField(upload_to='restaurant_gallery/', blank=True, null=True)
        gallery3 = models.ImageField(upload_to='restaurant_gallery/', blank=True, null=True)
        khalti_public_key = models.CharField(max_length=200, blank=True, null=True)
        khalti_secret_key = models.CharField(max_length=200, blank=True, null=True)


        

        def __str__(self):
            return self.restaurant_name

from authentication.models import User   

class MenuSection(models.Model):
    restaurant = models.ForeignKey(RestaurantDashboard, on_delete=models.CASCADE, related_name='menu_sections')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)


from django.utils import timezone

class MenuItem(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    photo = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    section = models.ForeignKey(MenuSection, on_delete=models.CASCADE, related_name='menu_items')
    is_public = models.BooleanField(default=False)


    
    discount = models.ForeignKey("Discount", null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name

    def get_discounted_price(self):
        today = timezone.now().date()

        # 1. Check for item-level discount
        if self.discount and self.discount.start_date <= today <= self.discount.end_date:
            return self.price - (self.price * self.discount.percentage / 100)

        # 2. Check for a global discount fallback
        from dashboard.models import Discount
        global_discount = Discount.objects.filter(is_global=True, start_date__lte=today, end_date__gte=today).first()
        if global_discount:
            return self.price - (self.price * global_discount.percentage / 100)

        return self.price

    
class Table(models.Model):
    restaurant = models.ForeignKey('RestaurantDashboard', on_delete=models.CASCADE, related_name='tables')
    number = models.CharField(max_length=10)
    x_position = models.IntegerField(help_text="X position on floor plan (in px)")
    y_position = models.IntegerField(help_text="Y position on floor plan (in px)")
    capacity = models.IntegerField(default=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.number} ({self.restaurant.restaurant_name})"

from dashboard.models import MenuItem 
class TableBooking(models.Model):
    # Choices for how payment will be made
    PAYMENT_METHOD_CHOICES = [
        ('online', 'Online'),
        ('restaurant', 'Pay at Restaurant'),
    ]

    # Table that is being booked
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='bookings')
    # Customer who made the booking
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Booking date and time
    date = models.DateField()
    time = models.TimeField()

    # Booking status
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Preordered menu items
    preordered_items = models.ManyToManyField(MenuItem, blank=True)

    # Payment details
    is_paid = models.BooleanField(default=False)
    amount = models.PositiveIntegerField(default=0)  # Stored in paisa (smallest currency unit)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='restaurant'
    )

    # Khalti payment fields (for online payment integration)
    khalti_public_key = models.CharField(max_length=100, blank=True, null=True)
    khalti_secret_key = models.CharField(max_length=100, blank=True, null=True)
    khalti_pidx = models.CharField(max_length=100, null=True, blank=True)
    extra_order_pidx = models.CharField(max_length=100, null=True, blank=True)

    use_sandbox = models.BooleanField(default=True)  # Sandbox mode for testing payments

    # Additional booking status
    is_cancelled = models.BooleanField(default=False)
    food_preferences = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    arrived = models.BooleanField(default=False)
    checked_in = models.BooleanField(default=False)
    extra_paid = models.BooleanField(default=False)

    # Final payment mode after dining (cash/online)
    final_payment_mode = models.CharField(
        max_length=10,
        choices=[("cash", "Cash"), ("online", "Online")],
        blank=True,
        null=True,
        help_text="How the final bill (including extra orders) was paid."
    )

    class Meta:
        # Ensure a table cannot be double-booked for the same date and time
        unique_together = ('table', 'date', 'time')

    def __str__(self):
        # Easy-to-read booking info
        return f"Booking for {self.table} on {self.date} at {self.time}"

    


#from .models import RestaurantDashboard     
class Menu(models.Model):
    restaurant = models.ForeignKey('RestaurantDashboard', on_delete=models.CASCADE, related_name='menus')
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    photo = models.ImageField(upload_to='menu_photos/', blank=True, null=True)

    def __str__(self):
        return self.name

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=RestaurantDashboard)
def create_menu_for_restaurant(sender, instance, created, **kwargs):
    if created and not Menu.objects.filter(restaurant=instance).exists():
        Menu.objects.create(
            restaurant=instance,
            name="Default Menu",
            description="Auto-generated menu",
            price=0.00  # required if not nullable
        )

class PreOrderItem(models.Model):
    # Link to the table booking (one booking can have many preorders)
    booking = models.ForeignKey('TableBooking', on_delete=models.CASCADE, related_name='preorders')
    
    # The menu item that was preordered
    menu_item = models.ForeignKey('MenuItem', on_delete=models.CASCADE)
    
    # How many units of the item were ordered
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        # Readable format: e.g., "Burger x2"
        return f"{self.menu_item.name} x{self.quantity}"

    
from .models import RestaurantDashboard

class Review(models.Model):
    restaurant = models.ForeignKey(RestaurantDashboard, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()  # or use choices
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.customer.username} for {self.restaurant.restaurant_name}"

    
class ExtraOrder(models.Model):
    booking = models.ForeignKey(TableBooking, on_delete=models.CASCADE, related_name='extra_orders')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} for booking {self.booking.id}"
    
class PayAtRestaurantPayment(models.Model):
    # Link to the table booking (one payment per booking)
    booking = models.OneToOneField(TableBooking, on_delete=models.CASCADE, related_name='restaurant_payment')
    
    # Total amount to be paid (stored in paisa for precision)
    total_amount = models.PositiveIntegerField()
    
    # Whether the customer has paid
    is_paid = models.BooleanField(default=False)
    
    # When the payment was made
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Whether extra amount was paid (for any changes)
    extra_paid = models.BooleanField(default=False)

    def __str__(self):
        # Readable representation for admin or shell
        return f"Payment for Booking {self.booking.id} - {'Paid' if self.is_paid else 'Pending'}"



class Discount(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    percentage = models.FloatField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_global = models.BooleanField(default=False)
    restaurant = models.ForeignKey(RestaurantDashboard, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.percentage}% off)"


