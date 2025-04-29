import pytest
from rest_framework.test import APIClient
from authentication.models import User
from dashboard.models import CustomerProfile

@pytest.mark.django_db
def test_customer_can_update_profile():
    client = APIClient()

    
    customer = User.objects.create_user(
        username="custuser",
        email="custuser@example.com",
        password="custpass",
        role="customer"
    )
    client.force_authenticate(user=customer)

    
    url = "/api/dashboard/customer/profile/"
    payload = {
        "phone_number": "9812345678",
        "allergies": "Peanuts",
        "food_preferences": "Vegetarian"
    }

    response = client.patch(url, payload, format="json")

    
    assert response.status_code == 200
    assert response.data["phone_number"] == "9812345678"
    assert response.data["allergies"] == "Peanuts"
    assert response.data["food_preferences"] == "Vegetarian"

    
    profile = CustomerProfile.objects.get(user=customer)
    assert profile.phone_number == "9812345678"
    assert profile.allergies == "Peanuts"
    assert profile.food_preferences == "Vegetarian"
