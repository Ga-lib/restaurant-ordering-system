from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_profile, name="register_profile"),
    path("me/", views.get_my_profile, name="get_my_profile"),
    path("", views.list_users, name="list_users"),
    path("<str:user_id>/update/", views.update_user, name="update_user"),
]