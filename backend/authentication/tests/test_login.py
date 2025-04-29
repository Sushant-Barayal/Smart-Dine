import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from authentication.models import User

@pytest.mark.django_db
def test_login_user():
    client = APIClient()

    # Create a test user
    User.objects.create_user(
        username="logintester",
        email="logintest@example.com",
        password="testpass123",
        role="customer"
    )

    url = reverse('login')

    data = {
        "email": "logintest@example.com",
        "password": "testpass123"
    }

    response = client.post(url, data, format='json')

    assert response.status_code == 200
    assert "access_token" in response.data  