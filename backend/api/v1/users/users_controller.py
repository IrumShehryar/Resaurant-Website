from flask import request
from .users_model import list_all_users,find_user_by_id, User

def get_users():
    users = list_all_users()
    return users.to_json(),200

def get_user_by_id(id):
    try:
        user = find_user_by_id(id)
    except(ValueError,TypeError):
        return{"error":"malformed input"},400
    
    if not user:
        return{"error":"not found"},404
    return user.to_json(),200

def create_user():
    data = request.get_json()
    user = User(**data)
    new_user = User.create_user(user)
    return new_user.to_json(),201


def get_current_user(current_user):
    user = User.objects.get(id=current_user.id)
    return user.to_json(),200