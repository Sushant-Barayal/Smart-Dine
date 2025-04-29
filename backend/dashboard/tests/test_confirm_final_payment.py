import pytest
from rest_framework.test import APIClient
from authentication.models import User
from dashboard.models import RestaurantDashboard, Table, TableBooking, PayAtRestaurantPayment
from datetime import date

@pytest.mark.django_db
def test_confirm_pay_at_restaurant_final_payment():
    client = APIClient()

    staff_user = User.objects.create_user(
        username="reststaff",
        email="reststaff@example.com",
        password="staffpass",
        role="restaurant"
    )
    client.force_authenticate(user=staff_user)

    restaurant = RestaurantDashboard.objects.create(
        user=staff_user,
        restaurant_name="Sizzler House",
        address="Pokhara"
    )

    table = Table.objects.create(
        number="B2",
        restaurant=restaurant,
        x_position=50,
        y_position=70,
        capacity=4
    )

    booking = TableBooking.objects.create(
        customer=staff_user,  # Simplified
        table=table,
        date=date.today(),
        time="19:00:00",
        payment_method="restaurant",
        is_confirmed=True,
        is_paid=False,
        is_cancelled=False
    )

    PayAtRestaurantPayment.objects.create(
        booking=booking,
        total_amount=0,
        is_paid=False
    )

    # ✅ Call confirm payment endpoint
    url = f"/api/dashboard/pay-at-restaurant/{booking.id}/confirm/"
    response = client.post(url)

    assert response.status_code == 200
    assert response.json()["message"] == "Marked as paid."
