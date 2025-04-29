from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    mark_arrived, pending_checkins, customer_checkins, rfid_checkin, assign_rfid,
    get_all_customers, customer_profile, restaurant_dashboard, get_menu, add_menu_section,
    add_menu_item, initiate_khalti_payment, verify_khalti_payment, restaurant_menus,
    all_public_menu_items, update_menu_item, get_public_menu, customer_cancel_booking,
    check_booked_tables, confirm_table_booking, cancel_booking, CancelTableBookingView,
    customer_bookings, delete_menu_item, delete_menu_section, TableListView, book,
    PublicRestaurantListView, PublicRestaurantDetailView, TableBookingListView, ReviewViewSet,
    ExtraOrderViewSet, get_pay_at_restaurant_total, mark_pay_at_restaurant_paid, 
    initiate_extra_order_payment, verify_extra_order_payment, mark_final_bill_paid,
    DiscountViewSet, PublicDiscountListAPIView, PublicMenuItemList
)

#  DRF ViewSets
review_list = ReviewViewSet.as_view({
    'get': 'list',
    'post': 'create',
})

# Router
router = DefaultRouter()
router.register(r'extra-orders', ExtraOrderViewSet, basename='extraorder')
router.register(r'discounts', DiscountViewSet, basename='discount')  

urlpatterns = [
    path('customer/profile/', customer_profile, name='customer-profile'),
    path('restaurant-dashboard/', restaurant_dashboard, name='restaurant-dashboard'),

    # Menu and Menu Sections
    path('menu/', get_menu, name='get_menu'),
    path('menu/section/', add_menu_section, name='add_menu_section'),
    path('menu/section/delete/<int:pk>/', delete_menu_section, name='delete_menu_section'),
    path('menu/item/', add_menu_item, name='add_menu_item'),
    path('menu/item/<int:pk>/', update_menu_item, name='update_menu_item'),
    path('menu/item/delete/<int:pk>/', delete_menu_item, name='delete_menu_item'),
    path('menu/public/', get_public_menu),
    path('menu/public/<int:restaurant_id>/', restaurant_menus),
    path('menus/public/', all_public_menu_items, name='all-public-menus'),
    

    # Table bookings
    path('tables/', TableListView.as_view(), name='table-list'),
    path('table-bookings/book/', book, name='book_table'),
    path('table-bookings/', TableBookingListView.as_view(), name='booking-list'),
    path('table-bookings/<int:booking_id>/cancel/', CancelTableBookingView.as_view(), name='booking-cancel'),
    path('table-bookings/<int:booking_id>/cancel-by-customer/', customer_cancel_booking),
    path('table-bookings/my/', customer_bookings, name='customer_bookings'),
    path('table-bookings/check/', check_booked_tables),
    path('table-bookings/<int:booking_id>/confirm/', confirm_table_booking),

    # Public restaurant list and detail
    path('restaurants/', PublicRestaurantListView.as_view(), name='restaurant-list'),
    path('restaurants/<int:pk>/details/', PublicRestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/public/', PublicRestaurantListView.as_view(), name='public_restaurants'),

    # Payments
    path('table-bookings/<int:booking_id>/pay/', initiate_khalti_payment),
    path('table-bookings/<int:booking_id>/verify-payment/', verify_khalti_payment),
    path('pay-at-restaurant/<int:booking_id>/total/', get_pay_at_restaurant_total),
    path('pay-at-restaurant/<int:booking_id>/confirm/', mark_pay_at_restaurant_paid),
    path('pay-at-restaurant/<int:booking_id>/finalize/', mark_final_bill_paid, name='mark_final_bill_paid'),
    path('final-payment/<int:booking_id>/confirm/', mark_final_bill_paid),  # duplicate confirm view

    # Extra Order Payments
    path('extra-orders/<int:booking_id>/pay/', initiate_extra_order_payment, name='initiate_extra_order_payment'),
    path('extra-orders/<int:booking_id>/verify-payment/', verify_extra_order_payment, name='verify_extra_order_payment'),

    # Check-in & RFID
    path('assign-rfid/<int:pk>/', assign_rfid, name='assign-rfid'),
    path('rfid-checkin/', rfid_checkin, name='rfid-checkin'),
    path('checkins/pending/', pending_checkins, name='pending-checkins'),
    path('checkins/mark-arrived/<int:pk>/', mark_arrived, name='mark-arrived'),
    path('customer-checkins/', customer_checkins, name='customer-checkins'),

    # Admin/Customer management
    path('admin/customers/', get_all_customers),
    path('admin/customers/<int:pk>/assign-rfid/', assign_rfid),
   

    # Reviews
    path('reviews/', review_list, name='review-list-create'),
    path('discounts/public/', PublicDiscountListAPIView.as_view(), name='public-discounts'),
    path('menus/public/', PublicMenuItemList.as_view(), name='public-menus'),

 
]

# Append router URLs
urlpatterns += router.urls
