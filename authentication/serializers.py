from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import User

# Get the user model (custom or default Django user model)
User = get_user_model()

# Serializer to handle user registration
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User  # The model this serializer is for
        fields = ['username', 'email', 'password', 'role']  # Fields to include
        extra_kwargs = {
            'password': {'write_only': True}  # Password should not be readable in responses
        }

    # Validate that the email is unique
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")  # Raise error if email already taken
        return value

    # Create a new user
    def create(self, validated_data):
        # Extract the password separately
        password = validated_data.pop('password')
        
        # Create a user instance without saving yet
        user = User(**validated_data)
        
        # Hash the password properly before saving
        user.set_password(password)
        
        # Save the user to the database
        user.save()
        
        return user  # Return the created user instance


# Serializer for user login
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        # Find user by email
        user = User.objects.filter(email=email).first()

        # Check if user exists and password matches
        if user is None or not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        # Restrict unapproved restaurant users from logging in
        if user.role == "restaurant" and not user.is_approved:
            raise serializers.ValidationError({"detail": "Your restaurant is not approved yet."})

        # Allow admin users to log in normally
        if user.role == "admin":
            return {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_approved": user.is_approved,
                "access_token": str(RefreshToken.for_user(user).access_token),
                "refresh_token": str(RefreshToken.for_user(user)),
            }

        # Generate tokens for other valid users
        refresh = RefreshToken.for_user(user)

        return {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_approved": user.is_approved,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'restaurant_name', 'address', 'role', 'is_approved']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

from rest_framework import serializers
from authentication.models import User


from rest_framework import serializers
from authentication.models import User

class CustomerWithRFIDSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    food_preferences = serializers.SerializerMethodField()
    allergies = serializers.SerializerMethodField()
    rfid_uid = serializers.CharField(read_only=True)  

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'location', 'food_preferences', 'allergies', 'rfid_uid']

    def get_phone_number(self, obj):
        return getattr(obj.customer_profile, 'phone_number', None)

    def get_location(self, obj):
        return getattr(obj.customer_profile, 'location', None)

    def get_food_preferences(self, obj):
        return getattr(obj.customer_profile, 'food_preferences', None)

    def get_allergies(self, obj):
        return getattr(obj.customer_profile, 'allergies', None)


