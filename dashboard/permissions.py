# dashboard/permissions.py

from rest_framework.permissions import BasePermission

class IsCustomer(BasePermission):
    """
    Allows access only to users with the 'customer' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'

from rest_framework import permissions

class IsRestaurant(permissions.BasePermission):
    """
    Allows access only to users with role='restaurant'
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'restaurant'
