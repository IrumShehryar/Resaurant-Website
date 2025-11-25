from marshmallow_mongoengine import ModelSchema
from api.v1.users.users_model import User


class UserSchema(ModelSchema):
    class Meta:
        model = User
        fields = ("id", "username", "email", "created_at")