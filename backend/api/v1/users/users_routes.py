from flask import Blueprint
from .users_controller import get_users,get_user_by_id,create_user,update_user_controller,delete_user_controller
#from api.utils.auth_utils import token_required

users_bp = Blueprint('users',__name__,url_prefix='/api/v1/users')

@users_bp.route('/', methods=['GET'])
def get_all_users():
    return get_users()

#@users_bp.route('/me',methods=['GET'])
#@token_required
#def get_me(current_user):
 #   print(current_user)
  #  return get_current_user(current_user)



@users_bp.route('/<id>',methods=['GET'])
def get_user(id):
    return get_user_by_id(id)

@users_bp.post("/")
def save_user():
    return create_user()

@users_bp.route('/<id>',methods=['PUT'])
def put_user (id):
    return update_user_controller(id)

@users_bp.route('/<id>',methods=['DELETE'])
def delete_user(id):
    return(delete_user_controller(id))

