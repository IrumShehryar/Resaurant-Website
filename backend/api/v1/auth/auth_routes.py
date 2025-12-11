# File: api/v1/auth/auth_routes.py

from flask import Blueprint, session, redirect
from backend.api.v1.auth.auth_controller import post_login, register

# Blueprint for auth routes
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

# -----------------------------
# LOGIN
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    return post_login()


# -----------------------------
# REGISTER
# -----------------------------
@auth_bp.route("/register", methods=["POST"])
def register_route():
    return register()


# -----------------------------
# LOGOUT
# -----------------------------
@auth_bp.route("/logout", methods=["GET"])
def logout():
    """
    Clears the session and redirects to login page.
    """
    session.clear()
    return redirect("/revontulet/login")
