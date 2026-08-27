from django.urls import path
from . import views
from . import message_views

urlpatterns = [
    path("", views.list_orders, name="list_orders"),
    path("create/", views.create_order, name="create_order"),
    path("stats/", views.get_order_stats, name="get_order_stats"),
    path("my-orders/", views.list_my_orders, name="list_my_orders"),
    path("<str:order_id>/", views.get_order, name="get_order"),
    path("<str:order_id>/status/", views.update_order_status, name="update_order_status"),
    path("<str:order_id>/payment/", views.update_payment, name="update_payment"),
    path("<str:order_id>/cancel/", views.cancel_order, name="cancel_order"),
    path("<str:order_id>/messages/", message_views.list_order_messages, name="list_order_messages"),
    path("<str:order_id>/messages/send/", message_views.send_order_message, name="send_order_message"),
]