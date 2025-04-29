from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/staff/notifications/', consumers.StaffNotificationConsumer.as_asgi()),
]
