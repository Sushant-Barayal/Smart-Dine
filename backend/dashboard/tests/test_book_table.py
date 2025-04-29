import pytest
from rest_framework.test import APIClient
from authentication.models import User
from dashboard.models import Table, RestaurantDashboard
from datetime import date

@pytest.mark.django_db
def test_customer_can_book_table():
    client = APIClient()

    customer = User.objects.create_user(
        username="bookcust",
        email="bookcust@example.com",
        password="testpass",
        role="customer"
    )
    client.force_authenticate(user=customer)

    restaurant_user = User.objects.create_user(
        username="resto",
        email="resto@example.com",
        password="restpass",
        role="restaurant"
    )
    restaurant = RestaurantDashboard.objects.create(
        user=restaurant_user,
        restaurant_name="Hotel Taj",
        address="Kathmandu",
    )

    table = Table.objects.create(
        number="A1",
        restaurant=restaurant,
        x_position=10,
        y_position=20,
        capacity=4
    )

    booking_data = {
        "table_id": table.id,  
        "date": str(date.today()),
        "time": "18:00:00",
        "payment_method": "restaurant"  
    }

    response = client.post("/api/dashboard/table-bookings/book/", booking_data, format='json')

    assert response.status_code == 201
    assert "booking_id" in response.data
