# File: utils/auth_utils.py
from functools import wraps
from flask import request, jsonify
import os
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from api.v1.users.users_model import User

def token_required(f):
    """Require JWT; inject `current_user` on success."""

    @wraps(f)  # preserve original function metadata
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth:
            return jsonify({"message": "Authorization header is missing"}), 401

        parts = auth.split()

        if parts[0].lower() != "bearer" or len(parts) != 2:
            return jsonify({"message": "Authorization header must be: Bearer <token>"}), 401

        token = parts[1]

        try:
            payload = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        except ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        user = User.objects(id=payload.get("user_id")).first()

        if not user:
            return jsonify({"message": "User not found"}), 401

        return f(current_user=user, *args, **kwargs)

    return decorated