import os
from flask import Flask, render_template, request, redirect, url_for, session
from translations import translations
from datetime import datetime, timedelta
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
from api.v1.menu.menu_routes import menu_bp
from api.v1.users.users_routes import users_bp
from api.v1.auth.auth_routes import auth_bp
from api.v1.reservation.reservation_route import reservation_bp
from api.v1.orders.orders_routes import orders_bp
from api.v1.users.users_model import User
from api.utils.db import mongo_connect
from api.utils.admin_stats import admin_stats_bp

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

# Register API blueprints
app.register_blueprint(menu_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(reservation_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(admin_stats_bp)

# Language switch
@app.route("/set_language/<lang>")
def set_language(lang):
    if lang in ["en", "fi"]:
        session["lang"] = lang
    return redirect(request.referrer or url_for("home"))

@app.context_processor
def inject_translations():
    lang = session.get("lang", "en")
    return {"t": translations[lang]}

# Basic pages
@app.get("/")
def home():
    return render_template("index.html")

@app.get("/menu")
def menu():
    try:
        highlight_day = datetime.now().strftime('%A')
    except Exception:
        highlight_day = None
    return render_template("menu.html", highlight_day=highlight_day)

@app.get("/menu/<int:item_id>")
def menu_item(item_id):
    return render_template("menu.html")

@app.get("/about")
def about():
    return render_template("about.html")

@app.get("/contact")
def contact():
    return render_template("contact.html")

@app.get("/reservation")
def reservation():
    return render_template("reservation.html")

@app.get("/cart")
def cart_page():
    item_id = request.args.get("item")
    return render_template("cart.html", added_item_id=item_id)

@app.get("/admin-login")
def admin_login():
    next_url = url_for("admin_interface")
    return render_template("login.html", next_url=next_url, role="admin")

@app.get("/admin-interface")
def admin_interface():
    return render_template("admin-interface.html")

@app.route('/admin-menu')
def admin_menu():
    # Determine language, default to English
    lang = session.get('lang', 'en')
    t = translations.get(lang, translations['en'])
    return render_template('admin-menu.html', t=t)

@app.route('/admin-orders')
def admin_orders():
    return render_template('admin-orders.html')

@app.route('/admin-reservations')
def admin_reservations():
    return render_template('admin-reservations.html')

@app.route('/admin-users')
def admin_users():
    return render_template('admin-users.html')

# -------------------------------
# Login route with session support
# -------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
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

            return redirect(next_url)
        else:
            return render_template("login.html", error="Invalid credentials", next_url=next_url, role="user")

    return render_template("login.html", next_url=next_url, role="user")

# -------------------------------
# Checkout route
# -------------------------------
@app.route("/checkout")
def checkout():
    if "user_id" not in session:
        return redirect(url_for("login", next=url_for("order_confirmation_page")))
    return redirect(url_for("order_confirmation_page"))

# -------------------------------
# Order confirmation page
# -------------------------------
@app.get("/order-confirmation")
def order_confirmation_page():
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
    session.clear()  # Clear session data
    return redirect(url_for("login"))

# -------------------------------
# Run server
# -------------------------------
if __name__ == "__main__":
    mongo_connect()
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG") == "1",
        use_reloader=os.getenv("FLASK_RELOADER") == "1",
    )
