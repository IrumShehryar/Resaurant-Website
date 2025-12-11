"""
menu_schema.py

Defines Marshmallow schema for MenuItem model for API serialization.
"""

from marshmallow_mongoengine import ModelSchema
from backend.api.v1.menu.menu_model import MenuItem


class MenuItemSchema(ModelSchema):
    """
    Marshmallow schema for serializing MenuItem objects for the API.
    """
    class Meta:
        model = MenuItem
        # Only expose the fields you actually want in the API
        fields = (
            "id",
            "name",
            "description",
            "price",
            "category",
            "image",
            "dietary",
            "allergens",
            "ingredients",
            "days_of_week",
            "active",
        )

