import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from authentication.models import User
from dashboard.models import CustomerProfile  

@pytest.mark.django_db
def test_admin_can_view_customers():
    client = APIClient()

    
    admin = User.objects.create_user(
        username='adminuser',
        email='admin@example.com',
        password='adminpass',
        role='admin',
        is_staff=True
    )
    client.force_authenticate(user=admin)

    
    cust1 = User.objects.create_user(username="cust1", email="c1@example.com", password="pass", role="customer")
    cust2 = User.objects.create_user(username="cust2", email="c2@example.com", password="pass", role="customer")

    CustomerProfile.objects.create(user=cust1, phone_number="1234567890")
    CustomerProfile.objects.create(user=cust2, phone_number="9876543210")

   
    response = client.get('/api/auth/customers/')

    
    assert response.status_code == 200
    assert len(response.data) == 2
    assert response.data[0]['email'] == "c1@example.com"
