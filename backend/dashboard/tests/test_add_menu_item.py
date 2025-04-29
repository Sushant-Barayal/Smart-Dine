import pytest
from rest_framework.test import APIClient
from authentication.models import User
from dashboard.models import RestaurantDashboard, MenuSection
from rest_framework import status

@pytest.mark.django_db
def test_restaurant_can_add_menu_item():
    client = APIClient()

    
    restaurant_user = User.objects.create_user(
        username="chefmaster",
        email="chef@example.com",
        password="cookpass",
        role="restaurant"
    )
    client.force_authenticate(user=restaurant_user)

    
    restaurant = RestaurantDashboard.objects.create(
        user=restaurant_user,
        restaurant_name="Delish Eats",
        address="New Baneshwor"
    )

    
    section = MenuSection.objects.create(
        restaurant=restaurant,
        name="Starters",
        description="Tasty appetizers"
    )

    
    payload = {
        "restaurant": restaurant.id,
        "section": section.id,
        "name": "Spring Rolls",
        "description": "Crispy and golden-fried rolls",
        "price": 250
    }

    
    response = client.post("/api/dashboard/menu/item/", data=payload)

    
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["name"] == "Spring Rolls"
