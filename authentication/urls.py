from django.urls import path
from .views import register_user, login_user, approve_restaurant, reject_restaurant, PendingRestaurantListView, CustomerListView, assign_rfid_to_customer, get_admin_profile, AdminMeView, AdminUserListView, admin_statistics

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('restaurants/pending/', PendingRestaurantListView.as_view(), name='pending-restaurants'),
    path('approve/<int:user_id>/', approve_restaurant, name='approve_restaurant'),  # New API
    path('restaurants/reject/<int:user_id>/', reject_restaurant, name='reject-restaurant'),

    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('assign-rfid/<int:user_id>/', assign_rfid_to_customer, name='assign-rfid'), 

    path('admin/me/', get_admin_profile),
    path('me/', AdminMeView.as_view(), name='admin-me'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/statistics/', admin_statistics),

    

]
