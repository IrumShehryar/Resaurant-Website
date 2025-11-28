from flask import request
import jwt
from api.utils.auth_utils import get_jwt_secret
from datetime import datetime, timezone, timedelta
import os

from api.v1.users.users_model import User
from api.v1.users.users_schema import UserSchema
from api.utils.simple_errors import simple_errors


def post_login():
    data = request.get_json()
    # ... credential check ...
    username = data.get("username")
    password = data.get("password")
    user = User.verify_credentials(username, password) # Uses bcrypt check internally

    if user:
        # this might cause security vulnerability in situations where JWT_SECRET_KEY does not exist
        # because then the token is create by using key hardcoded in the source code
        jwt_secret = get_jwt_secret()

        # 1. Create the payload with expiration time
        payload = {
         "user_id": str(user.id),
         "username": user.username,
         "role": user.role,
         "exp": datetime.now(timezone.utc) + timedelta(hours=24)  # Token expires in 24 hours
        }

        # 2. Encode the token
        token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        # 3. Return the user data and the token
        return {
             "message": "Login successful",
             "user": user.to_json(),
             "token": token
         }, 200
    else:
        return {"message": "Invalid credentials"}, 401
    
    
@simple_errors
def register():
    data = request.get_json() or {}

    # Never allow user to set their own role
    data.pop("role", None)

    user = User(**data)
    new_user = user.save()  # triggers clean() + pre_save (hash password)

    response_user = UserSchema().dump(new_user)
    return response_user, 201