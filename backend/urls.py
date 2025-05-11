from django.urls import path, include
from authentication.views import PendingRestaurantListView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin


urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),  # Add this line
    path('restaurants/pending/', PendingRestaurantListView.as_view(), name='pending-restaurants'),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/admin/', include('authentication.urls')),
    path('api/', include('authentication.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)