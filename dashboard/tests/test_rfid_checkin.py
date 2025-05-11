import pytest
from rest_framework.test import APIClient
from dashboard.models import RestaurantDashboard, Table, TableBooking, CustomerProfile
from authentication.models import User
from datetime import date

@pytest.mark.django_db
def test_customer_rfid_checkin_success():
    client = APIClient()

    restaurant_user = User.objects.create_user(
        username="rest1", email="rest1@example.com", password="restpass", role="restaurant"
    )
    restaurant = RestaurantDashboard.objects.create(
        user=restaurant_user,
        restaurant_name="Savor Place",
        address="Kathmandu"
    )

    table = Table.objects.create(
        number="A2",
        restaurant=restaurant,
        x_position=10,
        y_position=20,
        capacity=4
    )

    customer = User.objects.create_user(
        username="rfiduser",
        email="rfiduser@example.com",
        password="testpass",
        role="customer"
    )
    profile = CustomerProfile.objects.create(
        user=customer,
        phone_number="9800000000",
        allergies="Peanut",
        food_preferences="Vegetarian",
        rfid_uid="RFID123456"
    )

    TableBooking.objects.create(
        customer=customer,
        table=table,
        date=date.today(),
        time="18:00:00",
        is_confirmed=True,
        is_cancelled=False,
        arrived=False
    )
   
    response = client.post("/api/dashboard/rfid-checkin/", {"rfid_uid": "RFID123456"}, format="json")
   
    assert response.status_code == 200
    assert response.data["message"] == "Customer checked in (awaiting arrival)"
    assert response.data["customer"] == "rfiduser"
