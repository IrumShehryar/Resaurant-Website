# api/v1/menu/menu_schema.py

from marshmallow_mongoengine import ModelSchema
from api.v1.menu.menu_model import MenuItem


class MenuItemSchema(ModelSchema):
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


