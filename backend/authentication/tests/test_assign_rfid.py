import pytest
from rest_framework.test import APIClient
from authentication.models import User

@pytest.mark.django_db
def test_admin_can_approve_restaurant():
    client = APIClient()

    # Create admin
    admin = User.objects.create_user(
        username="admin1",
        email="admin@example.com",
        password="adminpass",
        role="admin",
        is_staff=True
    )
    client.force_authenticate(user=admin)

    # Create restaurant with is_approved = False
    restaurant = User.objects.create_user(
        username="res1",
        email="res1@example.com",
        password="pass123",
        role="restaurant"
    )
    restaurant.is_approved = False
    restaurant.save()

    # Approve the restaurant
    response = client.patch(f'/api/auth/approve/{restaurant.id}/')

    assert response.status_code == 200
    restaurant.refresh_from_db()
    assert restaurant.is_approved is True
