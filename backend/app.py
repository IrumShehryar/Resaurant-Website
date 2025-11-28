import os
"""Flask application entrypoint for the Restaurant Website project.

This module creates the Flask application, registers API blueprints and
serves the frontend templates and static assets located in the `frontend`
folder. The app is intentionally simple: the single-page menu front-end is
served from `menu.html` and uses the JSON endpoints under
`/api/v1/menu` to load data via XHR/Fetch.

Run options are read from environment variables when starting locally.

Key routes:
- GET /            -> serves index.html
- GET /menu        -> serves menu.html (single page app)
- GET /menu/<id>   -> serves menu.html (friendly deep-link for an item)

Notes:
- The API endpoints are provided by the `menu_bp` blueprint
  (see backend/api/v1/menu/*).
"""

from flask import Flask, render_template,request
from flask import session, redirect, url_for
from translations import translations
from datetime import datetime
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
from api.v1.menu.menu_routes import menu_bp
from api.v1.users.users_routes import users_bp
from api.v1.auth.auth_routes import auth_bp     
from api.utils.db import mongo_connect

load_dotenv()

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static",
    static_url_path="/static",
)
app.secret_key = "9f8sdf98sdf89sdfu89sdf89@#FSDfsd98f"

# If the app is running behind a proxy (nginx, etc) ProxyFix preserves
# original client scheme and path prefix. Adjust values when deploying.
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_prefix=1)

# Register REST API blueprint for menu endpoints
app.register_blueprint(menu_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)

@app.route("/set_language/<lang>")
def set_language(lang):
    if lang in ["en", "fi"]:
        session["lang"] = lang
    return redirect(request.referrer or url_for("home"))

@app.context_processor
def inject_translations():
    lang = session.get("lang", "en")
    return {"t": translations[lang]}

@app.get("/")
def home():
    """Render the root page (`index.html`).

    The page is a minimal entrypoint used for the static frontend.
    """
    return render_template("index.html")

@app.get("/users")
def users():
    return render_template("login.html")

@app.get("/menu")
def menu():
    """Render the SPA that lists the menu items.

    The front-end JavaScript will call the JSON API to populate content.
    """
    # Compute the current weekday name server-side so templates can render
    # a consistent "<Weekday> Highlights" heading without client JS.
    try:
        highlight_day = datetime.now().strftime('%A')
    except Exception:
        highlight_day = None

    return render_template("menu.html", highlight_day=highlight_day)

@app.get("/menu/<int:item_id>")
def menu_item(item_id):
    """Render the menu SPA for a deep link to a specific item.

    This endpoint intentionally returns the same `menu.html` file so the
    frontend can detect the path and open the item detail modal for
    `item_id` by calling `/api/v1/menu/<item_id>`.

    Args:
        item_id (int): menu item id parsed from the URL.

    Returns:
        A rendered HTML page (menu.html) — the frontend handles fetching
        of the item details as JSON.
    """
    return render_template("menu.html")

@app.get("/about")
def about():
    """Render the About Us page."""
    return render_template("about.html")

@app.get("/contact")
def contact():
    """Render the Contact Us page."""
    return render_template("contact.html")

@app.get("/reservation")
def reservation():
    """Render the Reservation/Reserve a Table page."""
    return render_template("reservation.html")

@app.get("/login")
def login():
    """Render the Login page."""
    next_url = request.args.get("next", "/")
    return render_template("login.html", next_url=next_url)

@app.route('/cart')
def cart_page():
    item_id = request.args.get('item')
    return render_template('cart.html',added_item_id=item_id)

@app.get("/admin-login")
def admin_login():
    return render_template("admin-login.html")

@app.get("/admin-interface")
def admin_interface():
    return render_template("admin-interface.html")

@app.get("/order-confirmation")
def order_confirmation_page():
    return render_template("order-confirmation.html")


if __name__ == "__main__":
    # When run directly, read run settings from environment variables.
    mongo_connect()
    app.run(
        host="127.0.0.1",
        port=os.getenv("PORT"),
        debug=os.getenv("FLASK_DEBUG"),
        use_reloader=os.getenv("FLASK_RELOADER"),
    )

