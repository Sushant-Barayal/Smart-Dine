# authentication/tests/test_register.py

import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from authentication.models import User

@pytest.mark.django_db
def test_register_user():
    client = APIClient()
    url = reverse('register')

    data = {
        "username": "newuser1",
        "email": "newuser1@example.com",
        "password": "securepass123",
        "role": "customer"
    }

    response = client.post(url, data, format='json')

    assert response.status_code == 201
    assert User.objects.filter(email="newuser1@example.com").exists()
