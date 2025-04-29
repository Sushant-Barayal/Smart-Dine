from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomerProfile
from .serializers import CustomerProfileSerializer
from .models import RestaurantDashboard
from .serializers import RestaurantDashboardSerializer
from .models import MenuSection, MenuItem
from .serializers import MenuSectionSerializer, MenuItemSerializer
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from .models import Table, TableBooking
from .serializers import TableSerializer, TableBookingSerializer
from .permissions import IsCustomer
from .serializers import RestaurantListSerializer, RestaurantDetailSerializer
from rest_framework import serializers
from .models import TableBooking
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import requests




@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])  # Ensures only logged-in users can access
def customer_profile(request):
    try:
        # Get or create profile for logged-in customer
        profile, created = CustomerProfile.objects.get_or_create(user=request.user)

        if request.method == 'GET':
            serializer = CustomerProfileSerializer(profile)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = CustomerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def restaurant_dashboard(request):
    user = request.user

    if user.role != 'restaurant' or not user.is_approved:
        return Response({"error": "You are not authorized to access this page."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        try:
            dashboard = RestaurantDashboard.objects.get(user=user)
            serializer = RestaurantDashboardSerializer(dashboard)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except RestaurantDashboard.DoesNotExist:
            return Response({"error": "Restaurant dashboard not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        print("🔵 Incoming POST data:", request.data)
        print("📎 Incoming POST files:", request.FILES)

        if RestaurantDashboard.objects.filter(user=user).exists():
            return Response({"error": "Dashboard already exists."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['user'] = user.id
        serializer = RestaurantDashboardSerializer(data=data)

        if serializer.is_valid():
            dashboard = serializer.save(user=user)

            # Save uploaded files if any
            for field in ['photo', 'floor_plan', 'gallery1', 'gallery2', 'gallery3']:
                if field in request.FILES:
                    setattr(dashboard, field, request.FILES[field])

            # Save Khalti credentials
            if 'khalti_public_key' in request.data:
                dashboard.khalti_public_key = request.data['khalti_public_key']
            if 'khalti_secret_key' in request.data:
                dashboard.khalti_secret_key = request.data['khalti_secret_key']

            dashboard.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("❌ POST Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        print("🟠 Incoming PUT data:", request.data)
        print("📎 Incoming PUT files:", request.FILES)

        dashboard = get_object_or_404(RestaurantDashboard, user=user)
        serializer = RestaurantDashboardSerializer(dashboard, data=request.data, partial=True)

        if serializer.is_valid():
            dashboard = serializer.save()

            # Save uploaded files if any
            for field in ['photo', 'floor_plan', 'gallery1', 'gallery2', 'gallery3']:
                if field in request.FILES:
                    setattr(dashboard, field, request.FILES[field])

            # Save Khalti credentials
            if 'khalti_public_key' in request.data:
                dashboard.khalti_public_key = request.data['khalti_public_key']
            if 'khalti_secret_key' in request.data:
                dashboard.khalti_secret_key = request.data['khalti_secret_key']

            dashboard.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print("❌ PUT Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_menu(request):
    if request.user.role != 'restaurant':
        return JsonResponse({'error': 'User is not a restaurant.'}, status=400)

    try:
        restaurant = RestaurantDashboard.objects.get(user=request.user)
    except RestaurantDashboard.DoesNotExist:
        return JsonResponse({'error': 'Restaurant dashboard not found.'}, status=404)

    menu_sections = MenuSection.objects.filter(restaurant=restaurant).prefetch_related('menu_items')

    serializer = MenuSectionSerializer(menu_sections, many=True)
    return JsonResponse(serializer.data, safe=False)



from authentication.models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_menu_section(request):
    try:
        dashboard = RestaurantDashboard.objects.get(user=request.user)
    except RestaurantDashboard.DoesNotExist:
        return Response({"error": "Restaurant dashboard not found"}, status=404)

    serializer = MenuSectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(restaurant=dashboard)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)




@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_menu_section(request, pk):
    user = request.user
    if user.role != 'restaurant':
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    section = get_object_or_404(MenuSection, id=pk, restaurant__user=user)
    section.delete()
    return Response({"message": "Section deleted"}, status=status.HTTP_204_NO_CONTENT)



from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_menu_item(request):
    if request.user.role != 'restaurant':
        return Response({'error': 'User is not a restaurant.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = MenuItemSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        menu_item = serializer.save()
        return Response(MenuItemSerializer(menu_item).data, status=status.HTTP_201_CREATED)

    print("❌ Menu item creation failed:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_menu_item(request, pk):
    user = request.user
    if user.role != 'restaurant' or not user.is_approved:
        return Response({"error": "You are not authorized to access this page."}, status=status.HTTP_403_FORBIDDEN)

    menu_item = get_object_or_404(MenuItem, pk=pk, section__restaurant__user=user)
    serializer = MenuItemSerializer(menu_item, data=request.data, partial=True)
    
    if serializer.is_valid():
        menu_item = serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_menu_item(request, pk):
    user = request.user
    if user.role != 'restaurant' or not user.is_approved:
        return Response({"error": "You are not authorized to access this page."}, status=status.HTTP_403_FORBIDDEN)

    menu_item = get_object_or_404(MenuItem, pk=pk, section__restaurant__user=user)
    menu_item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

class TableListView(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Table.objects.filter(restaurant__user=self.request.user)

    def perform_create(self, serializer):
        restaurant = self.request.user.restaurantdashboard  # This links to the RestaurantDashboard
        serializer.save(restaurant=restaurant)

from .serializers import TableBookingSerializer

from .permissions import IsRestaurant

# views.py
class TableBookingListView(generics.ListAPIView):
    serializer_class = TableBookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsRestaurant]

    def get_queryset(self):
        return TableBooking.objects.filter(
            table__restaurant__user=self.request.user,
            is_cancelled=False  # ✅ Exclude cancelled
        )

from rest_framework.views import APIView
class CancelTableBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRestaurant]

    def delete(self, request, booking_id):
        try:
            booking = TableBooking.objects.get(id=booking_id, table__restaurant__user=request.user)
            booking.is_cancelled = True  # ✅ Soft delete
            booking.save()
            return Response({"message": "Booking cancelled successfully"}, status=status.HTTP_200_OK)
        except TableBooking.DoesNotExist:
            return Response({"error": "Booking not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)



    
from django.core.mail import send_mail

from dashboard.models import Table, MenuItem  # ✅ Make sure MenuItem is imported
from decimal import Decimal

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book(request):
    from .models import PayAtRestaurantPayment

    user = request.user
    table_id = request.data.get('table_id')
    date = request.data.get('date')
    time = request.data.get('time')
    payment_method = request.data.get('payment_method', 'restaurant')
    preordered_items = request.data.get('preordered_items', [])

    if not all([table_id, date, time]):
        return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        table = Table.objects.get(id=table_id)

        # Check if table is already booked
        exists = TableBooking.objects.filter(
            table=table, date=date, time=time
        ).exists()

        if exists:
            return Response({"error": "This table is already booked for the selected time."}, status=400)

        # Create booking
        booking = TableBooking.objects.create(
            table=table,
            customer=user,
            date=date,
            time=time,
            payment_method=payment_method
        )

        if preordered_items:
            booking.preordered_items.set(preordered_items)

        # Create payment record if paying at restaurant
        if payment_method == "restaurant":
            preorder_total = Decimal(sum(item.price for item in booking.preordered_items.all()))
            PayAtRestaurantPayment.objects.create(
                booking=booking,
                total_amount=preorder_total,
                extra_paid=False
            )

        # Send confirmation email
        subject = "SmartDine Table Booking Confirmation"
        message = f"Hello {user.username},\n\nYour booking has been successfully placed.\n\n" \
                  f"Table: {table.number}\nDate: {date}\nTime: {time}\n\nThank you for booking with us!"
        recipient = [user.email]
        send_mail(subject, message, "noreply@smartdine.com", recipient)

        return Response({
            "message": "Booking created successfully!",
            "booking_id": booking.id
        }, status=201)

    except Table.DoesNotExist:
        return Response({"error": "Invalid table ID"}, status=404)

# List all restaurants (public view)
class PublicRestaurantListView(generics.ListAPIView):
    queryset = RestaurantDashboard.objects.all()
    serializer_class = RestaurantListSerializer

# Retrieve a single restaurant's detailed info (public view)
class PublicRestaurantDetailView(generics.RetrieveAPIView):
    queryset = RestaurantDashboard.objects.all()
    serializer_class = RestaurantDetailSerializer

    # Pass request context to the serializer (useful for full URLs, etc.)
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request  
        return context


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_bookings(request):
    user = request.user
    bookings = TableBooking.objects.filter(
        customer=user,
        is_cancelled=False  # ✅ FIX: Exclude cancelled bookings
    ).select_related('table__restaurant').prefetch_related('preordered_items')

    data = [
        {
            "id": booking.id,
            "restaurant_name": booking.table.restaurant.restaurant_name if booking.table and booking.table.restaurant else None,
            "table_number": booking.table.number,
            "date": booking.date,
            "time": booking.time,
            "is_confirmed": booking.is_confirmed,
            "is_cancelled": booking.is_cancelled,
            "preordered_items": MenuItemSerializer(booking.preordered_items.all(), many=True).data
        }
        for booking in bookings
    ]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    user = request.user
    try:
        booking = TableBooking.objects.get(id=booking_id, customer=user)
        if booking.is_confirmed:
            return Response({"error": "You cannot cancel a confirmed booking."}, status=400)
        booking.delete()
        return Response({"message": "Booking cancelled successfully."}, status=204)
    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found."}, status=404)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def customer_cancel_booking(request, booking_id):
    user = request.user
    try:
        booking = TableBooking.objects.get(id=booking_id, customer=user)

        if booking.is_cancelled:
            return Response({"message": "Booking already cancelled."}, status=200)

        booking.is_cancelled = True
        booking.save()
        return Response({"message": "✅ Your booking has been cancelled."}, status=200)

    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found or not authorized."}, status=404)
    
@api_view(['POST'])
@permission_classes([AllowAny])  # Public access is fine
def check_booked_tables(request):
    restaurant_id = request.data.get('restaurant_id')
    date = request.data.get('date')
    time = request.data.get('time')

    if not all([restaurant_id, date, time]):
        return Response({"error": "Missing parameters."}, status=400)

    booked_table_ids = TableBooking.objects.filter(
        table__restaurant_id=restaurant_id,
        date=date,
        time=time
    ).values_list('table_id', flat=True)

    return Response({"booked_table_ids": list(booked_table_ids)})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def confirm_table_booking(request, booking_id):
    user = request.user
    if user.role != 'restaurant':
        return Response({"error": "Unauthorized"}, status=403)

    try:
        booking = TableBooking.objects.get(id=booking_id, table__restaurant__user=user)

        if booking.is_confirmed:
            return Response({"message": "Already confirmed"}, status=200)

        booking.is_confirmed = True
        booking.save()

        # Send confirmation email to customer
        from django.core.mail import send_mail
        send_mail(
            subject="SmartDine: Your Booking Has Been Confirmed!",
            message=f"Hello {booking.customer.username},\n\nYour booking for table {booking.table.number} on {booking.date} at {booking.time} has been confirmed by the restaurant.\n\nThank you!",
            from_email="noreply@smartdine.com",
            recipient_list=[booking.customer.email],
            fail_silently=True
        )

        return Response({"message": "Booking confirmed and email sent."}, status=200)

    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)
    
from rest_framework import generics
from .models import MenuItem
from .serializers import MenuItemSerializer

@api_view(['GET'])
def get_public_menu(request):
    # Get restaurant ID from query params
    restaurant_id = request.GET.get('restaurant_id')

    try:
        # Fetch the restaurant dashboard
        dashboard = RestaurantDashboard.objects.get(pk=restaurant_id)
    except RestaurantDashboard.DoesNotExist:
        return Response({'error': 'Restaurant not found.'}, status=404)

    # Fetch all menu sections related to the restaurant
    sections = MenuSection.objects.filter(restaurant=dashboard).prefetch_related('menu_items')
    
    data = []
    for section in sections:
        items = section.menu_items.all()
        data.append({
            'section_id': section.id,
            'section_name': section.name,
            'items': MenuItemSerializer(items, many=True).data
        })

    # Return the restaurant name and all menu sections with items
    return Response({
        'restaurant_name': dashboard.restaurant_name,
        'sections': data
    })

@api_view(['GET'])
def restaurant_menus(request, restaurant_id):
    try:
        restaurant = User.objects.get(id=restaurant_id, role='restaurant')
    except User.DoesNotExist:
        return Response({'error': 'Restaurant not found.'}, status=404)

    sections = MenuSection.objects.filter(restaurant=restaurant).prefetch_related('menu_items')
    data = []
    for section in sections:
        items = section.menu_items.all()
        data.append({
            'section_id': section.id,
            'section_name': section.name,
            'items': MenuItemSerializer(items, many=True).data
        })
    return Response({
        'restaurant_name': restaurant.username,  # or restaurant.restaurant_name if using profile
        'sections': data
    })

from .serializers import TableBookingWithPreOrderSerializer
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_table_with_preorder(request):
    serializer = TableBookingWithPreOrderSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(customer=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def all_public_menu_items(request):
    items = MenuItem.objects.select_related('section', 'section__restaurant').all()

    data = []
    for item in items:
        data.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "photo": item.photo.url if item.photo else None,
            "restaurant_name": item.section.restaurant.restaurant_name if item.section and item.section.restaurant else "Unknown",
        })
    return Response(data)



from dashboard.models import TableBooking

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_khalti_payment(request, booking_id):
    print("🧠 Debug Khalti Payment")
    print("🔐 User:", request.user)
    print("🎯 Looking for booking ID:", booking_id)

    try:
        booking = TableBooking.objects.get(id=booking_id, customer=request.user)
    except TableBooking.DoesNotExist:
        return Response({'error': 'Booking not found or unauthorized.'}, status=404)

    restaurant = booking.table.restaurant
    public_key = getattr(restaurant, 'khalti_public_key', '').strip()
    secret_key = getattr(restaurant, 'khalti_secret_key', '').strip()

    print("📡 Restaurant ID:", restaurant.id)
    print("🟣 Public Key:", public_key)
    print("🔴 Secret Key:", secret_key)

    # 🧪 Validate keys
    if not public_key or not secret_key:
        return Response({'error': 'This restaurant has not set up Khalti payments.'}, status=400)

    # 💰 Calculate total in paisa
    total_amount = sum(float(item.price) for item in booking.preordered_items.all()) * 100
    print("💸 Total amount (paisa):", total_amount)

    if total_amount <= 0:
        return Response({'error': 'No preordered items found for payment.'}, status=400)

    # 📦 Payload for Khalti
    payload = {
        "return_url": f"http://localhost:3000/verify-payment/{booking.id}/",
        "website_url": "http://localhost:3000",
        "amount": int(total_amount),
        "purchase_order_id": f"BOOK-{booking.id}",
        "purchase_order_name": "Table Reservation",
        "customer_info": {
            "name": request.user.username,
            "email": request.user.email,
            "phone": "9800000000",  # Optional: Replace with dynamic field
        }
    }

    headers = {
        "Authorization": f"Key {secret_key}"
    }

    # 🌐 Call Khalti API
    response = requests.post("https://a.khalti.com/api/v2/epayment/initiate/", json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print("✅ Khalti Response:", data)
        return Response({
            "payment_url": data.get('payment_url'),
            "pidx": data.get('pidx'),
        })
    else:
        print("❌ Khalti Error:", response.text)
        return Response({"error": "Khalti initiation failed"}, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import requests
from .models import TableBooking

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_khalti_payment(request, booking_id):
    print("🔍 Verifying Khalti Payment")

    user = request.user
    pidx = request.data.get("pidx")

    try:
        booking = TableBooking.objects.get(id=booking_id, customer=user)
    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found or unauthorized."}, status=404)

    # 🧾 Helper to format invoice details
    def build_invoice_response(message, paid=False):
        total_amount = sum(item.price for item in booking.preordered_items.all())  # stored in paisa

        return {
            "message": message,
            "pidx": booking.khalti_pidx or pidx,
            "amount": int(total_amount),
            "restaurant": {
                "name": booking.table.restaurant.restaurant_name,
                "address": booking.table.restaurant.address,
            },
            "table_number": booking.table.number,
            "date": str(booking.date),
            "time": str(booking.time),
            "customer_name": user.username,
            "preordered_items": [
                {
                    "name": item.name,
                    "price": float(item.price),
                }
                for item in booking.preordered_items.all()
            ],
            "is_paid": paid
        }

    # ✅ Already verified
    if booking.is_paid:
    # Ensure method is correct even on re-verification
        if booking.payment_method != "online":
          booking.payment_method = "online"
          booking.save()
        return Response(build_invoice_response("Already verified.", paid=True), status=200)


    # 🔁 Verify with Khalti
    headers = {
        "Authorization": f"Key {booking.table.restaurant.khalti_secret_key}"
    }

    try:
        response = requests.post(
            "https://a.khalti.com/api/v2/epayment/lookup/",
            json={"pidx": pidx},
            headers=headers
        )
        khalti_data = response.json()

        if response.status_code != 200 or khalti_data.get("status") != "Completed":
            print("❌ Verification Error:", khalti_data)
            return Response({"error": "Payment not completed."}, status=400)

    except requests.exceptions.RequestException as e:
        print("❌ Request Exception:", e)
        return Response({"error": "Failed to connect to Khalti."}, status=500)

    # ✅ Update booking
    booking.is_paid = True
    booking.khalti_pidx = pidx
    booking.amount = khalti_data.get("total_amount", 0)

    # ✅ Force set method to 'online' to reflect actual payment source
    booking.payment_method = 'online'

    booking.save()

    return Response(build_invoice_response("Payment verified.", paid=True), status=200)


from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from rest_framework.exceptions import ValidationError

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        restaurant_id = self.request.query_params.get('restaurant_id')
        if restaurant_id:
            return Review.objects.filter(restaurant_id=restaurant_id)
        return Review.objects.none()

    def perform_create(self, serializer):
        customer = self.request.user
        restaurant_id = self.request.data.get('restaurant')

        if Review.objects.filter(customer=customer, restaurant_id=restaurant_id).exists():
            raise ValidationError({"detail": "You have already submitted a review for this restaurant."})

        serializer.save(customer=customer)

from django.utils import timezone

@api_view(['POST'])
def rfid_scan(request):
    rfid_uid = request.data.get('rfid_uid')

    if not rfid_uid:
        return Response({"error": "RFID UID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = CustomerProfile.objects.get(rfid_uid=rfid_uid)
        user = profile.user
    except CustomerProfile.DoesNotExist:
        return Response({"error": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()
    booking = TableBooking.objects.filter(customer=user, date=today, is_confirmed=True).first()

    if not booking:
        return Response({"error": "No confirmed booking found for today."}, status=status.HTTP_404_NOT_FOUND)

    booking.is_arrived = True
    booking.save()

    return Response({
        "message": "Customer arrived.",
        "customer": user.username,
        "table": booking.table.number,
        "time": str(booking.time),
        "preorder": [item.menu_item.name for item in booking.preorders.all()]
    })


from rest_framework.permissions import IsAdminUser
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_customers(request):
    customers = CustomerProfile.objects.select_related('user').all()
    serializer = CustomerProfileSerializer(customers, many=True)
    return Response(serializer.data)

from dashboard.models import CustomerProfile  # adjust import path if needed
import logging

logger = logging.getLogger(__name__)  # Optional: log to console

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def assign_rfid(request, pk):
    print("▶️ Assign RFID view called")  # Step 1

    try:
        customer = CustomerProfile.objects.get(pk=pk)
        print(f"✅ Found customer: {customer.user.username}")
    except CustomerProfile.DoesNotExist:
        print("❌ Customer not found")
        return Response({"error": "Customer not found"}, status=404)

    print("📦 Request data received:", request.data)  # Step 2

    rfid_uid = request.data.get('rfid_uid')
    if not rfid_uid:
        print("⚠️ Missing RFID UID in request")
        return Response({"error": "RFID UID is required"}, status=400)

    # Debug what is being assigned
    print(f"🎯 Assigning RFID UID '{rfid_uid}' to customer '{customer.user.username}'")

    customer.rfid_uid = rfid_uid
    customer.save()

    print("✅ RFID UID saved successfully")
    return Response({"message": "RFID assigned successfully"})

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['POST'])
@permission_classes([AllowAny])
def rfid_checkin(request):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    rfid_uid = request.data.get('rfid_uid')
    if not rfid_uid:
        return Response({"error": "RFID UID is required"}, status=400)

    try:
        profile = CustomerProfile.objects.get(rfid_uid=rfid_uid)
    except CustomerProfile.DoesNotExist:
        return Response({"error": "Invalid RFID tag"}, status=404)

    today = timezone.localtime().date()
    booking = TableBooking.objects.filter(
    customer=profile.user,
    date=today,
    is_confirmed=True,
    is_cancelled=False,
    arrived=False
).order_by('date', 'time', '-created_at').first()


    if not booking:
        return Response({"error": "No valid booking found for today"}, status=404)

    # ✅ Mark as scanned (but not arrived yet)
    booking.checked_in = True
    booking.save()
    print("✅ Checked-in flag set on booking:", booking.id)

    preorders = booking.preorders.all()
    items = [{"name": p.menu_item.name, "price": float(p.menu_item.price)} for p in preorders]

    # ✅ Real-time notification to staff group
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "staff_notifications",
        {
            "type": "send_notification",
            "content": {
                "message": f"{profile.user.username} checked in (awaiting arrival)",
                "table": booking.table.number,
            }
        }
    )

    return Response({
        "message": "Customer checked in (awaiting arrival)",
        "customer": profile.user.username,
        "table": booking.table.number,
        "booking_id": booking.id,
        "preorders": items
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_checkins(request):
    today = timezone.now().date()
    bookings = TableBooking.objects.filter(
        table__restaurant__user=request.user,
        date=today,
        is_confirmed=True,
        arrived=False,
        is_cancelled=False
    ).select_related('customer', 'table')

    data = [{
        "booking_id": b.id,
        "customer": b.customer.username,
        "table": b.table.number,
        "time": b.time.strftime("%I:%M %p")
    } for b in bookings]

    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_arrived(request, pk):
    try:
        booking = TableBooking.objects.get(pk=pk, table__restaurant__user=request.user)
        booking.arrived = True
        booking.save()
        return Response({"message": "Marked as arrived ✅"})
    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from dashboard.models import RestaurantDashboard, TableBooking

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_checkins(request):
    restaurant = get_object_or_404(RestaurantDashboard, user=request.user)

    today = timezone.localtime().date()
    bookings = TableBooking.objects.filter(
        table__restaurant=restaurant,
        date=today,
        is_confirmed=True,
        is_cancelled=False
    ).select_related('customer', 'table').prefetch_related('preordered_items', 'extra_orders__menu_item')

    data = []
    for b in bookings:
        extra_orders = b.extra_orders.all()

        preorder_total = sum(item.price for item in b.preordered_items.all())
        extra_total = sum(eo.menu_item.price * eo.quantity for eo in extra_orders)

        # Debug logging
        print(f"[DEBUG] Booking {b.id} | Preorder total: {preorder_total} | Extra: {extra_total} | Paid: {b.is_paid} | Method: {b.payment_method}")

        # Determine payment status
        is_khalti_paid = b.payment_method == "online" and b.is_paid
        is_cash_paid = b.payment_method == "restaurant" and b.is_paid

        # Check extra_paid from TableBooking field
        extra_paid = b.extra_paid if hasattr(b, 'extra_paid') else False

        data.append({
            "booking_id": b.id,
            "customer": b.customer.username,
            "table": b.table.number,
            "checked_in_time": b.created_at.strftime("%Y-%m-%d %H:%M") if b.checked_in else None,
            "checked_in": b.checked_in,
            "arrived": b.arrived,
            "payment_method": b.payment_method,
            "is_paid": is_cash_paid,
            "restaurant_id": b.table.restaurant.id,
            "extra_paid": extra_paid,  # ✅ Added for frontend to check extra payment
            'final_payment_mode': b.final_payment_mode,


            "preorders": [
                {"name": item.name, "price": float(item.price)}
                for item in b.preordered_items.all()
            ],
            "preorder_total": float(preorder_total) if not is_khalti_paid else 0,

            "extra_orders": [
                {
                    "menu_item_name": eo.menu_item.name,
                    "menu_item_price": float(eo.menu_item.price),
                    "quantity": eo.quantity,
                }
                for eo in extra_orders
            ],
            "total_extra_amount": float(extra_total),

            "final_total_amount": float(extra_total) if is_khalti_paid else float(preorder_total + extra_total)
        })

    return Response(data)





from .models import ExtraOrder
from .serializers import ExtraOrderSerializer
from rest_framework import viewsets

class ExtraOrderViewSet(viewsets.ModelViewSet):
    queryset = ExtraOrder.objects.all()
    serializer_class = ExtraOrderSerializer

    def get_queryset(self):
        booking_id = self.request.query_params.get('booking')
        if booking_id:
            return ExtraOrder.objects.filter(booking_id=booking_id).order_by('-added_at')
        return ExtraOrder.objects.none()


from .models import PayAtRestaurantPayment
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pay_at_restaurant_total(request, booking_id):
    booking = get_object_or_404(TableBooking, id=booking_id)

    # Only allow if staff owns the restaurant
    if booking.table.restaurant.user != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    extra_orders = booking.extra_orders.all()
    total = sum(order.quantity * order.menu_item.price for order in extra_orders)

    # Optionally create/update payment record
    payment, created = PayAtRestaurantPayment.objects.get_or_create(
        booking=booking,
        defaults={"total_amount": total * 100}  # convert to paisa
    )

    if not created:
        payment.total_amount = total * 100
        payment.save()

    return Response({
        "booking_id": booking.id,
        "customer": booking.customer.username,
        "table": booking.table.number,
        "total_amount": payment.total_amount,
        "is_paid": payment.is_paid
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_pay_at_restaurant_paid(request, booking_id):
    print(f"[DEBUG] Confirming payment for booking ID: {booking_id}")
    print(f"[DEBUG] Authenticated user: {request.user} (ID: {request.user.id})")

    try:
        booking = TableBooking.objects.get(id=booking_id, customer=request.user)
        print(f"[DEBUG] Booking Found: {booking}")
        print(f"[DEBUG] Booking Status: Paid={booking.is_paid}, Method={booking.payment_method}")
    except TableBooking.DoesNotExist:
        print(f"[ERROR] No booking found with ID={booking_id} for user {request.user}")
        return Response({"detail": "No matching booking."}, status=404)

    try:
        payment = PayAtRestaurantPayment.objects.get(booking=booking)
        print(f"[DEBUG] PayAtRestaurantPayment found: {payment}")
    except PayAtRestaurantPayment.DoesNotExist:
        print(f"[ERROR] No PayAtRestaurantPayment entry for booking {booking.id}")
        return Response({"detail": "No PayAtRestaurantPayment matches the given query."}, status=404)

    # Continue your logic here...

    payment = get_object_or_404(PayAtRestaurantPayment, booking_id=booking_id)

    if payment.booking.table.restaurant.user != request.user:
        return Response({"error": "Unauthorized"}, status=403)

    if payment.is_paid:
        return Response({"message": "Already marked as paid."})

    payment.is_paid = True
    payment.paid_at = timezone.now()
    payment.save()

    return Response({"message": "Marked as paid."})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_extra_order_payment(request, booking_id):
    from .models import TableBooking  # Make sure this import exists
    booking = get_object_or_404(TableBooking, id=booking_id, customer=request.user)
    print(f"[DEBUG] Initiating payment for booking {booking_id}")

    if booking.payment_method != "online":
        return Response({"error": "This booking is not eligible for online payment."}, status=400)

    if booking.extra_paid:
        return Response({"message": "Extra order already paid."}, status=400)


    total_amount = sum(item.menu_item.price * item.quantity for item in booking.extra_orders.all())
    if total_amount <= 0:
        return Response({"error": "No extra order amount to be paid."}, status=400)

    payload = {
        "return_url": "http://localhost:3000/khalti-verify",
        "website_url": "http://localhost:3000",
        "amount": int(total_amount * 100),  # in paisa
        "purchase_order_id": f"EXTRA-{booking.id}",
        "purchase_order_name": "Extra Order Payment",
    }

    headers = {
        "Authorization": f"Key {booking.khalti_secret_key}"
    }

    try:
        response = requests.post(
            "https://a.khalti.com/api/v2/epayment/initiate/",
            json=payload,
            headers=headers
        )
        data = response.json()
        if "pidx" in data:
            booking.khalti_pidx = data["pidx"]
            booking.save()
            return Response({
                "payment_url": data["payment_url"],
                "amount": int(total_amount * 100),
                "public_key": booking.khalti_public_key,
            })
        else:
            return Response(data, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_extra_order_payment(request, booking_id):
    booking = get_object_or_404(TableBooking, id=booking_id, customer=request.user)

    pidx = request.data.get("pidx")
    if not pidx:
        return Response({"error": "PIDX is required"}, status=400)

    headers = {
        "Authorization": f"Key {booking.khalti_secret_key}"
    }

    try:
        verify_res = requests.post(
            "https://a.khalti.com/api/v2/epayment/lookup/",
            json={"pidx": pidx},
            headers=headers
        )
        result = verify_res.json()

        if result.get("status") == "Completed":
            booking.extra_paid = True
            booking.save()
            return Response({"message": "✅ Extra order payment successful"})
        else:
            return Response({"error": "Payment not completed"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_final_bill_paid(request, booking_id):
    print(f"[DEBUG] Marking final payment for booking {booking_id}")
    method = request.data.get("method")  # "cash" or "online"
    if method not in ["cash", "online"]:
        return Response({"error": "Invalid method. Choose 'cash' or 'online'."}, status=400)

    try:
        booking = TableBooking.objects.get(id=booking_id)
    except TableBooking.DoesNotExist:
        return Response({"error": "Booking not found."}, status=404)

    if not booking.checked_in:
        return Response({"error": "Customer has not checked in yet."}, status=400)

    # ✅ Mark as paid
    booking.is_paid = True
    booking.extra_paid = True
    booking.final_payment_mode = method
    booking.save()

    return Response({
        "message": f"Booking {booking_id} marked as paid via {method}."
    }, status=200)

from rest_framework import viewsets
from .models import Discount
from .serializers import DiscountSerializer
from django.db.models import Q


class DiscountViewSet(viewsets.ModelViewSet):
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # For GET: only show discounts belonging to the logged-in restaurant
        user = self.request.user
        try:
            restaurant = RestaurantDashboard.objects.get(user=user)
            return Discount.objects.filter(restaurant=restaurant)
        except RestaurantDashboard.DoesNotExist:
            return Discount.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        restaurant = RestaurantDashboard.objects.get(user=user)
        serializer.save(restaurant=restaurant)

from django.utils import timezone
from .models import Discount
from .serializers import DiscountSerializer
from rest_framework import generics

class PublicDiscountListAPIView(generics.ListAPIView):
    serializer_class = DiscountSerializer
    permission_classes = []

    def get_queryset(self):
        now = timezone.now().date()
        return Discount.objects.filter(start_date__lte=now, end_date__gte=now)
    
from .models import MenuItem
from .serializers import MenuItemSerializer
from rest_framework import generics

class PublicMenuItemList(generics.ListAPIView):
    queryset = MenuItem.objects.filter(is_public=True)
    serializer_class = MenuItemSerializer
    permission_classes = [] 


