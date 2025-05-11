from rest_framework import serializers
from .models import CustomerProfile, RestaurantDashboard, MenuSection, MenuItem
from .models import Table, TableBooking

class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')   
    email = serializers.EmailField(source='user.email')       
    id = serializers.IntegerField(source='user.id')           
    rfid_uid = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id',              
            'username',
            'email',
            'phone_number',
            'location',
            'food_preferences',
            'allergies',
            'customer_photo',
            'rfid_uid',        
        ]


from django.db.models import Avg
class RestaurantDashboardSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True)
    map_location = serializers.CharField(required=False, allow_blank=True, max_length=1000)  # ⬅️ increased max_length
    opening_time = serializers.TimeField(required=False, allow_null=True)
    closing_time = serializers.TimeField(required=False, allow_null=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantDashboard
        fields = [
            'id', 'restaurant_name', 'location', 'phone_number', 'address', 'additional_details',
            'photo', 'description', 'map_location', 'opening_time', 'closing_time',
            'gallery1', 'gallery2', 'gallery3','khalti_public_key', 'khalti_secret_key','average_rating'
        ]
        read_only_fields = ['user']

    def get_average_rating(self, obj):
        avg = Review.objects.filter(restaurant=obj).aggregate(avg_rating=Avg('rating'))['avg_rating']
        return round(avg, 1) if avg else None

from rest_framework import serializers
from .models import MenuItem, Discount

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'name', 'percentage', 'description', 'start_date', 'end_date', 'is_global', 'restaurant']
        read_only_fields = ['restaurant']

    def create(self, validated_data):
        request = self.context.get("request")
        if not validated_data.get("is_global", False):
            try:
                restaurant = RestaurantDashboard.objects.get(user=request.user)
                validated_data["restaurant"] = restaurant
            except RestaurantDashboard.DoesNotExist:
                raise serializers.ValidationError("Restaurant not found.")
        return super().create(validated_data)


from rest_framework import serializers
from .models import MenuItem, RestaurantDashboard
from django.db.models import Q



class MenuItemSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()
    discount = DiscountSerializer(read_only=True)
    discount_id = serializers.PrimaryKeyRelatedField(
        queryset=Discount.objects.all(),
        source='discount',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'photo',
            'section', 'restaurant', 'discount', 'discount_id'
        ]

    def get_restaurant(self, obj):
        if obj.section and obj.section.restaurant:
            return {
                "id": obj.section.restaurant.id,
                "name": obj.section.restaurant.restaurant_name
            }
        return None

    def validate_section(self, section):
        request = self.context.get("request")
        try:
            restaurant = RestaurantDashboard.objects.get(user=request.user)
        except RestaurantDashboard.DoesNotExist:
            raise serializers.ValidationError("Restaurant not found.")

        if section.restaurant != restaurant:
            raise serializers.ValidationError("Section does not belong to the current restaurant.")

        return section

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Filter discount dropdown to current restaurant + global
        request = self.context.get("request")
        if request and hasattr(request.user, 'restaurant_dashboard'):
            restaurant = request.user.restaurant_dashboard
            self.fields['discount_id'].queryset = Discount.objects.filter(
                Q(is_global=True) | Q(restaurant=restaurant)

            )




        
class MenuSectionSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)  # 👈 Include related items

    class Meta:
        model = MenuSection
        fields = ['id', 'name', 'description', 'menu_items']  # 👈 Include 'menu_items'


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'x_position', 'y_position', 'capacity',]

class TableBookingSerializer(serializers.ModelSerializer):
    table_number = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()
    preordered_items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.username', read_only=True)

    # ✅ Safe fields from CustomerProfile
    phone_number = serializers.SerializerMethodField()
    food_preferences = serializers.SerializerMethodField()
    allergies = serializers.SerializerMethodField()

    class Meta:
        model = TableBooking
        fields = [
            'id',
            'table_number',
            'restaurant_name',
            'customer_name',
            'phone_number',
            'food_preferences',
            'allergies',
            'created_at',
            'date',
            'time',
            'is_confirmed',
            'is_cancelled',
            'is_paid',
            'payment_method',
            'amount',
            'preordered_items',
        ]

    def get_table_number(self, obj):
        return obj.table.number if obj.table else None

    def get_restaurant_name(self, obj):
        return obj.table.restaurant.restaurant_name if obj.table and obj.table.restaurant else None

    def get_preordered_items(self, obj):
        return [
            {
                "id": item.id,
                "name": item.name,
                "price": item.price
            }
            for item in obj.preordered_items.all()
        ]

    # ✅ Use safe access for related customer profile
    def get_phone_number(self, obj):
        profile = getattr(obj.customer, 'customer_profile', None)
        return profile.phone_number if profile and profile.phone_number else "Not provided"

    def get_food_preferences(self, obj):
        profile = getattr(obj.customer, 'customer_profile', None)
        return profile.food_preferences if profile and profile.food_preferences else "None"

    def get_allergies(self, obj):
        profile = getattr(obj.customer, 'customer_profile', None)
        return profile.allergies if profile and profile.allergies else "None"


from rest_framework import serializers
from .models import RestaurantDashboard
from django.db.models import Avg

class RestaurantListSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantDashboard
        fields = [
            'id',
            'restaurant_name',
            'address',
            'location',
            'phone_number',
            'additional_details',
            'photo',
            'average_rating',  # ✅ Safe, confirmed, and working
        ]

    def get_average_rating(self, obj):
        return round(obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0, 1)




class TableInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'x_position', 'y_position', 'capacity']

class RestaurantDetailSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantDashboard
        fields = '__all__'

    def get_photo(self, obj):
        request = self.context.get('request')
        if obj.photo and hasattr(obj.photo, 'url'):
            return request.build_absolute_uri(obj.photo.url)
        return None


from rest_framework import generics
from .models import MenuItem
from .serializers import MenuItemSerializer


class PublicMenuListView(generics.ListAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

from .models import Menu

class MenuSerializer(serializers.ModelSerializer):
    sections = MenuSectionSerializer(many=True, read_only=True)  # 👈 Add this line

    class Meta:
        model = Menu
        fields = ['id', 'name', 'description', 'price', 'photo', 'sections']

from .models import PreOrderItem
# serializers.py
class PreOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreOrderItem
        fields = ['id', 'menu_item', 'quantity']

class TableBookingWithPreOrderSerializer(serializers.ModelSerializer):
    preorders = PreOrderItemSerializer(many=True)

    class Meta:
        model = TableBooking
        fields = ['id', 'table', 'date', 'time', 'is_confirmed', 'preorders']

    def create(self, validated_data):
        preorders_data = validated_data.pop('preorders')
        booking = TableBooking.objects.create(**validated_data)
        for preorder in preorders_data:
            PreOrderItem.objects.create(booking=booking, **preorder)
        return booking
    
from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'customer_name', 'restaurant', 'rating', 'comment', 'created_at']
        read_only_fields = ['customer', 'created_at']

from rest_framework import serializers
from .models import ExtraOrder

class ExtraOrderSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.FloatField(source='menu_item.price', read_only=True)

    class Meta:
        model = ExtraOrder
        fields = ['id', 'booking', 'menu_item', 'menu_item_name', 'menu_item_price', 'quantity', 'added_at']
