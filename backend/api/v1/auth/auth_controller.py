
from flask import request, session
from backend.api.utils.auth_utils import get_jwt_secret
import jwt
from backend.api.v1.users.users_model import User
from backend.api.utils.simple_errors import simple_errors

# Shared JWT token generator
def generate_jwt_token(user):
    payload = {
        "user_id": str(user.id),
        "role": user.role
    }
    secret = get_jwt_secret()
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token


def handle_auth_response(user):
    """
    Helper to handle authentication response for login/register.
    Returns (response, status_code)
    """
    if user.role == "admin":
        token = generate_jwt_token(user)  # Your JWT generation logic
        # session["user_id"] = str(user.id)  # Optional: if you want session for admin too
        # session["role"] = user.role
        return {"token": token, "role": "admin"}, 200
    else:
        session.permanent = True
        session["user_id"] = str(user.id)
        session["role"] = user.role
        session["user_name"] = getattr(user, "name", None) or user.username
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

    # Use helper for unified response
    response, status = handle_auth_response(user)
    return response, status


@simple_errors
def register():
    data = request.get_json() or {}
    # Do not allow client to set role
    data.pop("role", None)

    # Create user object and save (triggers validation & password hashing)
    user = User(**data)
    new_user = user.save()

    response, status = handle_auth_response(new_user)
    return response, status
