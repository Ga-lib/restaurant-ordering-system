from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_menu_items, name="list_menu_items"),
    path("create/", views.create_menu_item, name="create_menu_item"),
    path("upload-image/", views.upload_menu_image, name="upload_menu_image"),
    path("weather-recommendations/", views.get_weather_recommendations, name="get_weather_recommendations"),
    path("<str:item_id>/", views.get_menu_item, name="get_menu_item"),
    path("<str:item_id>/update/", views.update_menu_item, name="update_menu_item"),
    path("<str:item_id>/delete/", views.delete_menu_item, name="delete_menu_item"),
]