from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
import cloudinary.uploader
from utils.cloudinary_config import cloudinary  # runs cloudinary.config() setup
from utils.auth import require_role
from firebase.firebase_config import db
from .serializers import MenuItemSerializer
from utils.weather import get_current_weather_tags

COLLECTION = "menu_items"


@api_view(["GET"])
def list_menu_items(request):
    """Get all menu items. Supports optional ?category= and ?available_only=true filters."""
    category = request.query_params.get("category")
    available_only = request.query_params.get("available_only")

    query = db.collection(COLLECTION)

    if category:
        query = query.where("category", "==", category)
    if available_only == "true":
        query = query.where("is_available", "==", True)

    docs = query.stream()
    items = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        items.append(data)

    return Response(items, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_menu_item(request, item_id):
    """Get a single menu item by its Firestore document id."""
    doc_ref = db.collection(COLLECTION).document(item_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

    data = doc.to_dict()
    data["id"] = doc.id
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@require_role("admin")
def create_menu_item(request):
    """Create a new menu item (Admin only, once auth is added)."""
    serializer = MenuItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    now = datetime.now(timezone.utc).isoformat()
    data["created_at"] = now
    data["updated_at"] = now

    doc_ref = db.collection(COLLECTION).document()  # auto-generated id
    doc_ref.set(data)

    data["id"] = doc_ref.id
    return Response(data, status=status.HTTP_201_CREATED)



@api_view(["PUT"])
@require_role("admin")
def update_menu_item(request, item_id):
    """Update an existing menu item (Admin only, once auth is added)."""
    doc_ref = db.collection(COLLECTION).document(item_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = MenuItemSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    data["updated_at"] = datetime.now(timezone.utc).isoformat()

    doc_ref.update(data)

    updated_doc = doc_ref.get().to_dict()
    updated_doc["id"] = item_id
    return Response(updated_doc, status=status.HTTP_200_OK)



@api_view(["DELETE"])
@require_role("admin")
def delete_menu_item(request, item_id):
    """Delete a menu item (Admin only, once auth is added)."""
    doc_ref = db.collection(COLLECTION).document(item_id)
    doc = doc_ref.get()

    if not doc.exists:
        return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)

    doc_ref.delete()
    return Response({"message": "Menu item deleted"}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@require_role("admin")
@parser_classes([MultiPartParser, FormParser])
def upload_menu_image(request):
    """Upload a food/drink image to Cloudinary and return its URL."""
    file = request.FILES.get("image")

    if not file:
        return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

    upload_result = cloudinary.uploader.upload(
        file,
        folder="menu_items",  # keeps images organized inside Cloudinary
    )

    return Response(
        {"image_url": upload_result.get("secure_url")},
        status=status.HTTP_201_CREATED,
    )
    
@api_view(["GET"])
def get_weather_recommendations(request):
    """Public: returns current weather tags + matching menu items."""
    weather_tags = get_current_weather_tags()

    if not weather_tags:
        return Response({"weather_tags": [], "items": []}, status=status.HTTP_200_OK)

    query = db.collection(COLLECTION).where("weather_tags", "array_contains_any", weather_tags)
    docs = query.stream()

    items = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        items.append(data)

    return Response({"weather_tags": weather_tags, "items": items}, status=status.HTTP_200_OK)