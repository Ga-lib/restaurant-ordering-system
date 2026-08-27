from django.urls import path
from . import views

urlpatterns = [
    path("generate/", views.generate_ai_report, name="generate_ai_report"),
]