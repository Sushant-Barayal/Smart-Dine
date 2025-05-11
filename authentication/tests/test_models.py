# authentication/tests/test_models.py

import pytest
from authentication.models import User

@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpassword',
        role='customer'
    )
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.check_password('testpassword')
    assert user.role == 'customer'
