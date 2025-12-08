"""
users_schema.py

Defines Marshmallow schema for User model for API serialization.
"""

from marshmallow_mongoengine import ModelSchema
from backend.api.v1.users.users_model import User


class UserSchema(ModelSchema):
    """
    Marshmallow schema for serializing User objects for the API.
    """
    class Meta:
        model = User
        fields = ("id", "username", "email", "created_at")