from django.urls import path
from . import views

urlpatterns = [
    path("menu-item/<str:menu_item_id>/", views.list_reviews_for_item, name="list_reviews_for_item"),
    path("create/", views.create_review, name="create_review"),
]