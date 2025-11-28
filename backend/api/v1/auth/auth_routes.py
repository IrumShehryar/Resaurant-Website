from flask import Blueprint

from api.v1.auth.auth_controller import post_login,register

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route("/login", methods=["POST"])
def login():
    return post_login()

@auth_bp.route("/register", methods=["POST"])
def register_route():
    return register()