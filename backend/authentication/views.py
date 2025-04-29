from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from .serializers import LoginSerializer
from .serializers import RestaurantSerializer 
from rest_framework.views import APIView    
from rest_framework.permissions import IsAdminUser
from .models import User
from rest_framework.decorators import api_view, permission_classes

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "message": "Registration successful!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    else:
        print(serializer.errors)  # Log the errors for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Admin can approve a restaurant
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def approve_restaurant(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="restaurant")
        user.is_approved = True
        user.save()
        return Response({"message": "Restaurant approved successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

# List all pending (unapproved) restaurants
class PendingRestaurantListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        pending_restaurants = User.objects.filter(role='restaurant', is_approved=False)
        serializer = RestaurantSerializer(pending_restaurants, many=True)
        return Response(serializer.data)

# Admin can reject (delete) a restaurant
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def reject_restaurant(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="restaurant")
        user.delete()
        return Response({"message": "Restaurant rejected and deleted"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)
    
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import User
from .serializers import UserSerializer


from authentication.serializers import CustomerWithRFIDSerializer

class CustomerListView(ListAPIView):
    queryset = User.objects.filter(role='customer')
    serializer_class = CustomerWithRFIDSerializer
    permission_classes = [IsAdminUser]

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def assign_rfid_to_customer(request, user_id):
    print("🔍 Incoming data:", request.data)

    try:
        user = User.objects.get(id=user_id, role='customer')
    except User.DoesNotExist:
        return Response({'detail': 'Customer not found.'}, status=status.HTTP_404_NOT_FOUND)

    rfid = request.data.get('rfid') or request.data.get('rfid_uid')
    print("📦 Parsed RFID:", rfid)

    if not rfid:
        return Response({'detail': 'RFID UID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user.rfid_uid = rfid
    user.save()
    return Response({'detail': 'RFID assigned successfully ✅'})



from rest_framework.permissions import IsAuthenticated
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_profile(request):
    user = request.user
    if user.role != 'admin':
        return Response({"detail": "Unauthorized"}, status=403)

    serializer = UserSerializer(user)
    return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from authentication.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta

from authentication.models import User
from dashboard.models import RestaurantDashboard, MenuItem, TableBooking, CustomerProfile

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_statistics(request):
    total_users = User.objects.count()
    total_restaurants = RestaurantDashboard.objects.count()
    total_menus = MenuItem.objects.count()
    total_bookings = TableBooking.objects.count()
    total_discounts = MenuItem.objects.exclude(discount=None).count()
    total_rfid_checkins = CustomerProfile.objects.exclude(rfid_uid=None).count()

    # Pie Chart - User roles
    user_roles = [
        User.objects.filter(role='admin').count(),
        User.objects.filter(role='customer').count(),
        User.objects.filter(role='restaurant').count(),
    ]

    # Monthly Bookings - last 6 months
    bookings_by_month = []
    bookings_labels = []
    today = now()
    for i in range(5, -1, -1):
        month = today - timedelta(days=30 * i)
        count = TableBooking.objects.filter(created_at__month=month.month).count()
        bookings_labels.append(month.strftime('%b'))
        bookings_by_month.append(count)

    # Payments placeholder
    total_payments = 0
    payments_received = 0
    payments_pending = 0

    return Response({
        "total_users": total_users,
        "total_restaurants": total_restaurants,
        "total_menus": total_menus,
        "total_bookings": total_bookings,
        "total_discounts": total_discounts,
        "total_rfid_checkins": total_rfid_checkins,
        "total_payments": total_payments,
        "user_roles": user_roles,
        "bookings_months": bookings_labels,
        "bookings_counts": bookings_by_month,
        "payments_data": [payments_received, payments_pending]
    })
