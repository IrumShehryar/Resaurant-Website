from flask import Blueprint
from .users_controller import get_users,get_user_by_id_controller,create_user_admin,register_user,update_user_controller,delete_user_controller,get_current_user
from api.utils.auth_utils import token_required,admin_required

users_bp = Blueprint('users',__name__,url_prefix='/api/v1/users')

#Admin list all users
@users_bp.route('/', methods=['GET'])
@admin_required
def get_all_users():
    return get_users()

# Admin: create user (can set role)
@users_bp.post("/")
@admin_required
def save_user():
    return create_user_admin()

# Public registration (no token)
@users_bp.post("/register")
def register():
    return register_user()


# Logged-in user: get own profile
@users_bp.route('/me',methods=['GET'])
@token_required
def get_me(current_user):
   print(current_user)
   return get_current_user(current_user)


# Admin: get user by id
@users_bp.route('/<id>',methods=['GET'])
@admin_required
def get_user(id):
    return get_user_by_id_controller(id)


# Admin: update user by id
@users_bp.route('/<id>',methods=['PUT'])
@admin_required
def put_user (id):
    return update_user_controller(id)


# Admin: delete user by id
@users_bp.route('/<id>',methods=['DELETE'])
@admin_required
def delete_user(id):
    return(delete_user_controller(id))

