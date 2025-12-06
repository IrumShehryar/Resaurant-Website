"""
users_controller.py

Controller helpers for the users JSON API. Handles CRUD operations and registration for users.
"""

from flask import request
from .users_model import list_all_users,find_user_by_id, update_user,delete_user,User
from .users_schema import UserSchema
from api.utils.simple_errors import simple_errors
from api.utils.validators import validate_user_fields


@simple_errors
def get_users():
    """
    Controller: GET /api/v1/users
    Returns all users as JSON.
    """
    users = list_all_users()
    users_json= UserSchema(many=True).dump(users)
    return users_json,200

def get_user_by_id_controller(id):
    """
    Controller: GET /api/v1/users/<id>
    Returns a single user by ID as JSON.
    """
    try:
        user = find_user_by_id(id)
    except(ValueError,TypeError):
        return{"error":"malformed input"},400
    
    if not user:
        return{"error":"not found"},404
    return user.to_json(),200


@simple_errors
def register_user():
    """
    Controller: POST /api/v1/users/register
    Public registration: always create a normal user.
    """
    data = request.get_json() or {}
    data.pop("role", None)  # force role to default "user"
    

    user = User(**data)
    new_user = user.save()
    nice_user = UserSchema().dump(new_user)
    return nice_user, 201



@simple_errors
def create_user_admin():
    """
    Controller: POST /api/v1/users
    Admin-only: create a user (can set role).
    """
    data = request.get_json()
    user = User(**data)
    new_user = user.save()
    nice_user = UserSchema().dump(new_user)
    return nice_user,201


def get_current_user(current_user):
    """
    Controller: GET /api/v1/users/me
    Returns the profile of the logged-in user.
    """
    user = User.objects.get(id=current_user.id)
    return user.to_json(),200

@simple_errors
def update_user_controller(user_id):
    """
    Controller: PUT /api/v1/users/<id>
    Updates an existing user by ID.
    """
    data = request.get_json()
    try:
        validate_user_fields(
            name=data.get("name", ""),
            username=data.get("username", ""),
            email=data.get("email", ""),
            password=data.get("password", ""),
            phone=data.get("phone", ""),
            address=data.get("address", "")
        )
        user = update_user(user_id, data)
        return user.to_json(), 200
    except Exception as ve:
        return {"error": str(ve)}, 400
      
@simple_errors
def delete_user_controller(user_id):
    """
    Controller: DELETE /api/v1/users/<id>
    Deletes a user by ID.
    """
    try:
        result = delete_user(user_id)
        return result,200
    except:
        return {"error":"User not found"},404