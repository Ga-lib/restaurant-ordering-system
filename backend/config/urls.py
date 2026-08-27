from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/menu/', include('apps.menu.urls')),
    path('api/tables/', include('apps.tables.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/ai-reports/', include('apps.ai_reports.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
    path('api/settings/', include('apps.settings.urls')),
]