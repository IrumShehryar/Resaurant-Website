
"""
Main Flask application for Restaurant Website backend.

This file initializes the Flask app, configures session management, registers blueprints, and sets up routes for the restaurant website backend.

Author: Irum Shehryar ,Kanwaljit Singh ,Farhan Ashraf, Saba Akbar
Created: 2025-12-07
Description: Flask backend for restaurant website, handles routing, sessions, and API integration.
"""

import os
from flask import Flask, render_template, request, redirect, url_for, session
from backend.translations import translations
from datetime import datetime, timedelta
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv

 # Fetch reservations and orders for this user
from backend.api.v1.reservation.reservation_model import ReserveTable
from backend.api.v1.orders.orders_model import Orders
from backend.api.v1.menu.menu_routes import menu_bp
from backend.api.v1.users.users_routes import users_bp
from backend.api.v1.auth.auth_routes import auth_bp
from backend.api.v1.reservation.reservation_route import reservation_bp
from backend.api.v1.orders.orders_routes import orders_bp
from backend.api.v1.users.users_model import User
from backend.api.utils.db import mongo_connect
from backend.api.utils.admin_stats import admin_stats_bp
from backend.api.v1.menu.menu_stats import menu_stats_bp

from werkzeug.security import check_password_hash
from bson import ObjectId

load_dotenv()

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static",
    static_url_path="/static",
)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback_secret_key")
app.config["SESSION_PERMANENT"] = True
app.permanent_session_lifetime = timedelta(days=7)

# Proxy fix if behind nginx or other proxy
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_prefix=1)


"""
Register API blueprints for different modules (menu, users, auth, reservation, orders, admin stats, menu stats).
"""
app.register_blueprint(menu_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(reservation_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(admin_stats_bp)
app.register_blueprint(menu_stats_bp)

## -----------------------------------
# Language switch
## -----------------------------------
@app.route("/set_language/<lang>")
def set_language(lang):
    """
    Route to set the language for the session.
    Args:
        lang (str): Language code ('en' or 'fi').
    Returns:
        Redirect to previous page or home.
    """
    if lang in ["en", "fi"]:
        session["lang"] = lang
    return redirect(request.referrer or url_for("home"))

## -----------------------------------
# Inject translations into templates
## -----------------------------------
@app.context_processor
def inject_translations():
    """
    Injects translation dictionary into templates based on session language.
    Returns:
        dict: Translation dictionary for current language.
    """
    lang = session.get("lang", "en")
    return {"t": translations[lang]}

## -----------------------------------
# Basic pages
## -----------------------------------
@app.get("/")
def home():
    """
    Renders the home page.
    Returns:
        Rendered index.html template.
    """
    return render_template("index.html")

@app.get("/menu")
def menu():
    """
    Renders the menu page with the current highlight day.
    Returns:
        Rendered menu.html template.
    """
    try:
        highlight_day = datetime.now().strftime('%A')
    except Exception:
        highlight_day = None
    return render_template("menu.html", highlight_day=highlight_day)

@app.get("/menu/<int:item_id>")
def menu_item(item_id):
    """
    Renders a specific menu item page.
    Args:
        item_id (int): ID of the menu item to display.
    Returns:
        Rendered menu.html template.
    """
    return render_template("menu.html")

@app.get("/about")
def about():
    """
    Renders the about page.
    Returns:
        Rendered about.html template.
    """
    return render_template("about.html")

@app.get("/contact")
def contact():
    """
    Renders the contact page.
    Returns:
        Rendered contact.html template.
    """
    return render_template("contact.html")

@app.get("/reservation")
def reservation():
    user_data = {
        "name": "",
        "email": "",
        "phone": ""
    }
    user_id = session.get("user_id")
    if user_id:
        user = User.objects(id=user_id).first()
        if user:
            user_data = {
                "name": user.name or "",
                "email": user.email or "",
                "phone": user.phone or ""
            }
    return render_template("reservation.html", user=user_data)

@app.get("/cart")
def cart_page():
    """
    Renders the cart page with the optionally added item.
    Returns:
        Rendered cart.html template.
    """
    item_id = request.args.get("item")
    return render_template("cart.html", added_item_id=item_id)

@app.get("/admin-login")
def admin_login():
    """
    Renders the admin login page.
    Returns:
        Rendered login.html template for admin.
    """
    next_url = url_for("admin_interface")
    return render_template("login.html", next_url=next_url, role="admin")

@app.get("/admin-interface")
def admin_interface():
    """
    Renders the admin interface page.
    Returns:
        Rendered admin-interface.html template.
    """
    return render_template("admin-interface.html")

@app.route('/admin-menu')
def admin_menu():
    """
    Renders the admin menu page.
    Returns:
        Rendered admin-menu.html template.
    """
    return render_template('admin-menu.html')

@app.route('/admin-orders')
def admin_orders():
    """
    Renders the admin orders page.
    Returns:
        Rendered admin-orders.html template.
    """
    return render_template('admin-orders.html')

@app.route('/admin-reservations')
def admin_reservations():
    """
    Renders the admin reservations page.
    Returns:
        Rendered admin-reservations.html template.
    """
    return render_template('admin-reservations.html')

@app.route('/admin-users')
def admin_users():
    """
    Renders the admin users page.
    Returns:
        Rendered admin-users.html template.
    """
    return render_template('admin-users.html')

# -------------------------------
# Login route with session support
# -------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    """
    Logs in a user and starts a session.
    Handles user authentication and redirects to the next page.
    """
    next_url = request.args.get("next", "/")

    if "user_id" in session:
        # Already logged in → redirect to next
        return redirect(next_url)

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        # Fetch user from DB
        user = User.objects(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            # Store user info in session
            session.permanent = True
            session["user_id"] = str(user.id)
            session["user_name"] = user.name
            session["user_email"] = user.email
            session["user_phone"] = user.phone
            
            print("LOGIN SESSION:", dict(session))
            return redirect(next_url)
        else:
            return render_template("login.html", error="Invalid credentials", next_url=next_url, role="user")

    return render_template("login.html", next_url=next_url, role="user")

# -------------------------------
# Checkout route
# -------------------------------
@app.route("/checkout")
def checkout():
    """
    Redirects to the order confirmation page if the user is logged in.
    If not logged in, redirects to the login page.
    """
    if "user_id" not in session:
        return redirect(url_for("login", next=url_for("order_confirmation_page")))
    return redirect(url_for("order_confirmation_page"))

# -------------------------------
# Order confirmation page
# -------------------------------
@app.get("/order-confirmation")
def order_confirmation_page():
    """
    Renders the order confirmation page with user data.
    Returns:
        Rendered order-confirmation.html template.
    """
    user_data = {
        "name": "Not provided",
        "phone": "Not provided",
        "email": "Not provided",
        "address": "Not provided"
    }

    user_id = session.get("user_id")
    if user_id:
        user = User.objects(id=user_id).first()
        if user:
            user_data = {
                "name": user.name or "Not provided",
                "phone": user.phone or "Not provided",
                "email": user.email or "Not provided",
                "address": user.address or "Not provided"
            }

    return render_template("order-confirmation.html", user=user_data)

# -------------------------------
# Logout route
# -------------------------------
@app.route("/logout")
def logout():
    """
    Logs out the user by clearing the session.
    Redirects to the login page.
    """
    session.clear()  # Clear session data
    return redirect(url_for("login"))


## -----------------------------------
# User dashboard page
## -----------------------------------
@app.get("/user-dashboard")
def user_dashboard():
    """
    Renders the user dashboard page with user data, reservations, and orders.
    Returns:
        Rendered user-dashboard.html template.
    """
    user_data = {"name": "", "email": "", "phone": "", "address": "", "role": ""}
    reservations = []
    orders = []
    user_id = session.get("user_id")
    if user_id:
        user = User.objects(id=user_id).first()
        if user:
            user_data = {
                "name": user.name or "",
                "email": user.email or "",
                "phone": user.phone or "",
                "address": user.address or "",
            
            }
           
            reservations = ReserveTable.objects(email=user.email)
            orders = Orders.objects(email=user.email)
    return render_template("user-dashboard.html", user=user_data, reservations=reservations, orders=orders)

# -------------------------------
# Run server
# -------------------------------

# -----------------------------------
# Run server
# -----------------------------------
if __name__ == "__main__":
    mongo_connect()
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG") == "1",
        use_reloader=os.getenv("FLASK_RELOADER") == "1",
    )
