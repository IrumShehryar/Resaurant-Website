# File: api/v1/auth/auth_controller.py

from flask import request, session
from api.v1.users.users_model import User
from api.utils.simple_errors import simple_errors


@simple_errors
def post_login():
    """
    Login endpoint: verify credentials, store user info in session.
    Returns user details for frontend.
    """
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"message": "Username and password are required"}, 400

    # Verify credentials (bcrypt check internally)
    user = User.verify_credentials(username, password)
    if not user:
        return {"message": "Invalid credentials"}, 401

    # Store user info in Flask session
    session.permanent = True
    session["user_id"] = str(user.id)
    session["role"] = user.role  # optional, can be used later

    # Return user info for frontend
    response_user = {
        "message": "Login successful",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "name": getattr(user, "name", ""),
            "email": getattr(user, "email", ""),
            "phone": getattr(user, "phone", ""),
            "address": getattr(user, "address", ""),
            "role": user.role
        }
    }

    return response_user, 200


@simple_errors
def register():
    """
    Register endpoint: create a new user, store info in session, and return details.
    """
    data = request.get_json() or {}

    # Do not allow client to set role
    data.pop("role", None)

    # Create user object and save (triggers validation & password hashing)
    user = User(**data)
    new_user = user.save()

    # Automatically log in the user
    session["user_id"] = str(new_user.id)
    session["role"] = new_user.role
    

    response_user = {
        "message": "User registered successfully",
        "user": {
            "id": str(new_user.id),
            "username": new_user.username,
            "name": getattr(new_user, "name", ""),
            "email": getattr(new_user, "email", ""),
            "phone": getattr(new_user, "phone", ""),
            "address": getattr(new_user, "address", ""),
            "role": new_user.role
        }
    }

    return response_user, 201
