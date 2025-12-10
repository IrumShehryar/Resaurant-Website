"""
users_routes.py

Flask Blueprint exposing the users JSON API. Handles routes for CRUD operations and registration.
"""

from flask import Blueprint
from backend.api.v1.users.users_controller import get_users, get_user_by_id_controller, create_user_admin, register_user, update_user_controller, delete_user_controller, get_current_user
from backend.api.utils.auth_utils import token_required,admin_required

users_bp = Blueprint('users',__name__,url_prefix='/api/v1/users')

#Admin list all users
@users_bp.route('/', methods=['GET'])
@admin_required
def get_all_users():
    """
    Controller: GET /api/v1/users/
    Admin-only: Returns all users as JSON.
    """
    return get_users()

# Admin: create user (can set role)
@users_bp.post("/")
@admin_required
def save_user():
    """
    Controller: POST /api/v1/users/
    Admin-only: Creates a user (can set role).
    """
    return create_user_admin()

# Public registration (no token)
@users_bp.post("/register")
def register():
    """
    Controller: POST /api/v1/users/register
    Public registration: creates a normal user.
    """
    return register_user()


# Logged-in user: get own profile
@users_bp.route('/me',methods=['GET'])
@token_required
def get_me(current_user):
    """
    Controller: GET /api/v1/users/me
    Returns the profile of the logged-in user.
    """
    return get_current_user(current_user)


# Admin: get user by id
@users_bp.route('/<id>',methods=['GET'])
@admin_required
def get_user(id):
    """
    Controller: GET /api/v1/users/<id>
    Admin-only: Returns a single user by ID as JSON.
    """
    return get_user_by_id_controller(id)


# Admin: update user by id
@users_bp.route('/<id>',methods=['PUT'])
@admin_required
def put_user (id):
    """
    Controller: PUT /api/v1/users/<id>
    Admin-only: Updates an existing user by ID.
    """
    return update_user_controller(id)


# Admin: delete user by id
@users_bp.route('/<id>',methods=['DELETE'])
@admin_required
def delete_user(id):
    """s
    Controller: DELETE /api/v1/users/<id>
    Admin-only: Deletes a user by ID.
    """
    return(delete_user_controller(id))

