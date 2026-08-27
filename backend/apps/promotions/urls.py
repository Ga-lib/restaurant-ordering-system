from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_promotions, name="list_promotions"),
    path("create/", views.create_promotion, name="create_promotion"),
    path("validate/", views.validate_promotion, name="validate_promotion"),
    path("<str:promo_id>/update/", views.update_promotion, name="update_promotion"),
    path("<str:promo_id>/delete/", views.delete_promotion, name="delete_promotion"),
]