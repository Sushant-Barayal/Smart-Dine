import pytest
from rest_framework.test import APIClient
from dashboard.models import Table, TableBooking, RestaurantDashboard
from authentication.models import User

@pytest.mark.django_db
def test_customer_view_bookings():
    client = APIClient()

    customer = User.objects.create_user(
        username="bookingcust",
        email="bookingcust@example.com",
        password="custpass",
        role="customer"
    )
    client.force_authenticate(user=customer)

    restaurant_user = User.objects.create_user(
        username="rest1",
        email="rest1@example.com",
        password="restpass",
        role="restaurant"
    )

    restaurant = RestaurantDashboard.objects.create(
        user=restaurant_user,
        restaurant_name="Sajilo Eats",
        address="City Center"
    )

    table = Table.objects.create(
        number="T7",
        restaurant=restaurant,
        x_position=0,
        y_position=0,
        capacity=4
    )

    TableBooking.objects.create(
        customer=customer,
        table=table,
        date="2025-04-30",
        time="15:00:00",
        is_confirmed=True
    )

    response = client.get("/api/dashboard/table-bookings/my/")

    assert response.status_code == 200
    assert isinstance(response.data, list)
    assert len(response.data) == 1
    assert response.data[0]["table_number"] == "T7"
