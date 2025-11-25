from flask import request
import jwt
from datetime import datetime, timezone, timedelta
import os

from api.v1.users.users_model import User


def post_login():
    data = request.get_json()
    # ... credential check ...
    username = data.get("username")
    password = data.get("password")
    user = User.verify_credentials(username, password) # Uses bcrypt check internally

    if user:
        # this might cause security vulnerability in situations where JWT_SECRET_KEY does not exist
        # because then the token is create by using key hardcoded in the source code
        jwt_secret = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")

        # 1. Create the payload with expiration time
        payload = {
         "user_id": str(user.id),
         "username": user.username,
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