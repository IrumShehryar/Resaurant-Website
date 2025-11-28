from flask import request
from .users_model import list_all_users,find_user_by_id, update_user,delete_user,User
from .users_schema import UserSchema
from api.utils.simple_errors import simple_errors


@simple_errors
def get_users():
    users = list_all_users()
    users_json= UserSchema(many=True).dump(users)
    return users_json,200

def get_user_by_id_controller(id):
    try:
        user = find_user_by_id(id)
    except(ValueError,TypeError):
        return{"error":"malformed input"},400
    
    if not user:
        return{"error":"not found"},404
    return user.to_json(),200


@simple_errors
def register_user():
    """Public registration: always create a normal user."""
    data = request.get_json() or {}
    data.pop("role", None)  # force role to default "user"
     # If username is not provided, default to email
    if "username" not in data and "email" in data:
        data["username"] = data["email"]
    
    user = User(**data)
    new_user = user.save()
    nice_user = UserSchema().dump(new_user)
    return nice_user, 201



@simple_errors
def create_user_admin():
    data = request.get_json()
    user = User(**data)
    new_user = user.save()
    nice_user = UserSchema().dump(new_user)
    return nice_user,201


def get_current_user(current_user):
    user = User.objects.get(id=current_user.id)
    return user.to_json(),200

@simple_errors
def update_user_controller(user_id):
    try:
        user=update_user(user_id,request.get_json())
        return user.to_json(),200
    except:
          return {"error": "User not found"}, 404
      
@simple_errors
def delete_user_controller(user_id):
    try:
        result = delete_user(user_id)
        return result,200
    except:
        return {"error":"User not found"},404