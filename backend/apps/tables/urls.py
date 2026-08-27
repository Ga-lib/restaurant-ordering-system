from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_tables, name="list_tables"),
    path("create/", views.create_table, name="create_table"),
    path("<str:table_id>/update/", views.update_table, name="update_table"),
    path("<str:table_id>/delete/", views.delete_table, name="delete_table"),
    path("<str:table_id>/hold/", views.hold_table, name="hold_table"),
    path("<str:table_id>/confirm/", views.confirm_reservation, name="confirm_reservation"),
    path("<str:table_id>/release/", views.release_table, name="release_table"),
]