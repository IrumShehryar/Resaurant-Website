# Revontulet Flamehouse — Restaurant Website

Full stack project  
**Frontend:** HTML / CSS / JavaScript  
**Backend:** Python (Flask) + MongoDB

## 👥 Group Members

-   Irum Shehryar
-   Kanwaljit Singh
-   Farhan Ashraf
-   Saba Akbar

## ✨ Project idea

A restaurant website inspired by the Northern Lights (“Revontulet”), with a warm “flamehouse” vibe. Users can browse the menu, add items to a cart, and place orders; admins manage menu items, reservations, users, and orders.

## 👥 Target Audience
Fast food Lovers

## 🎤 Presentation highlights

-   **Team roles**
    -   **Irum Shehryar:** End-to-end menu flow (frontend ↔ backend), admin dashboard/menu management, admin auth, base layout, customer dashboard, deployment, Lighthouse/performance, HTML/CSS validation, JSDoc/ApiDoc, validation.
    -   **Kanwaljit Singh:** Cart + order flow (frontend ↔ backend), customer login/registration, session management, language translations, UI enhancements.
    -   **Farhan Ashraf:** Reservation flow (frontend ↔ backend), About/Contact design, admin reservation + order management documentation.
    -   **Saba Akbar:** CSS styling, feedback form, menu theme/selection, menu modal enhancements, image curation, MongoDB data insertion.
-   **Helper utilities**
    -   Shared CRUD services and table manager/renderer centralize fetch calls and table rendering, so admin views reuse the same data plumbing instead of bespoke AJAX/DOM code—faster delivery and fewer bugs.
-   **Accomplished**
    -   Live deployment, JSDoc + ApiDoc generated, validation evidence captured; full flows for menu, cart/checkout, reservations, admin CRUD, login/registration, today’s menu highlighting, pricing and dietary flags, fi/en scaffolding.
-   **Problems faced**
    -   Keeping language dictionaries current across pages was tedious;
    -   Metropolia deployment (SSL/reverse proxy) was tricky;
    -   aligning auth/session checks for protected routes needed care.
    - 
-   **Lessons learned**
    -   Better Git workflow,
    -   deployment pipeline know-how,
    -    and code reuse patterns (shared services/components) saved time and bugs.
      
-   **AI disclosure (GitHub Copilot)**
    - Used for comments,
    - debugging,
    - learning when stuck.
    - Avoid over-relying: ask it what could be wrong before letting it change code; keep review in the loop.
    - 
-   **Future enhancements**
    -   Complete user management;
    -   sorting/filtering in admin panels (pending/confirmed/etc.);
    -   real-time notifications for new orders/reservations;
    -   improved user dashboard layout; richer API integrations.
    -   Search bar
    -   Secure Payment integration

## 🚀 Setup & Run (local)

1. **Clone**

```sh
git clone https://github.com/IrumShehryar/Restaurant-Website.git
cd Restaurant-Website
```

2. **Create & activate venv**

-   Windows:

```sh
python -m venv .venv
.\.venv\Scripts\activate
```

-   macOS/Linux:

```sh
python3 -m venv .venv
source .venv/bin/activate
```

3. **Install deps**

```sh
python -m pip install --upgrade pip
pip install -r requirements.txt
```

4. **Set env vars** (via `.env` or shell)

-   `MONGODB_URI`
-   `JWT_SECRET_KEY`

5. **Run Flask app**

```sh
python -m backend.app
```

6. **Access the app**
   Use the server URL (VPN required): https://10.120.32.85/revontulet/

---

## 📚 Documentation

### Python backend docs (pdoc)

Generate HTML docs for backend code:

```sh
pdoc backend/app.py -o docs/pdoc
```

Open the generated HTML files in `docs/pdoc/` in your browser.

### JavaScript frontend docs (JSDoc)

Generate docs for JS files:

```sh
npx jsdoc frontend/static/js -r -d docs/jsdoc
```

Open the generated HTML files in `docs/jsdoc/` in your browser.

### API documentation

-   See `backend/apidoc.json` (static JSON, not interactive)

---

## 🚀 Deployment

### Local/Development

-   Run the backend as above.
-   Serve frontend files with a static server or from Flask if desired.

### Production Deployment

The application is deployed on a server at **https://10.120.32.85/revontulet/**

**Deployment Steps:**

1. **Access the server** (requires credentials)
2. **Clone/pull the latest code** to the server
3. **Set up environment variables:**
    - Create a `.env` file with:
        - `MONGODB_URI` (production MongoDB connection)
        - `JWT_SECRET_KEY` (secure key)
        - `FLASK_ENV=production`
4. **Install/update dependencies:**
    ```sh
    pip install -r requirements.txt
    ```
5. **Run with a production WSGI server** (e.g., Gunicorn):
    ```sh
    gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
    ```
6. **Configure reverse proxy** (Nginx/Apache) to:
    - Serve static files efficiently
    - Forward API requests to the Flask app
    - Handle SSL/TLS certificates

---

## 🧪 Testing Guide

Follow these steps to test all functionalities of the Revontulet Flamehouse website:

### **1. User Registration & Login**

-   Go to the **Login/Register** page
-   Create a new account with email and password
-   Log in with your credentials
-   Verify that you're redirected to the menu or dashboard

### **2. Browse Menu**

-   Navigate to the **Menu** page
-   Verify all menu items are displayed with images, names, prices, and categories
-   Check that items are organized by category (Starter, Main, Dessert, Side, Drink)
-   Click on an item to see details in a modal

### **3. Shopping Cart**

-   Add items to cart from the menu
-   Go to **Cart** page
-   Verify items are listed with quantities and prices
-   Change item quantities and verify the total updates
-   Remove items and verify cart updates
-   Proceed to checkout

### **4. Place an Order**

-   From the cart, proceed to checkout
-   Fill in delivery details
-   Submit the order
-   You should see an **Order Confirmation** page with order number and details
-   Check that email confirmation is sent

### **5. Make a Reservation**

-   Go to the **Reservation** page
-   Select a date and time
-   Enter number of guests
-   Submit the reservation
-   Verify confirmation message appears

### **6. View Order & Reservation History**

-   Log in as a customer
-   Access your **Profile/Dashboard**
-   Check your past orders and reservations with status

### **7. Admin Functions** (requires admin login)

-   Log in with admin credentials(via the admin login link at the bottom of page)
-   Access **Admin Dashboard**
-   Test the following:
    -   **Menu Management:** Add, edit, delete menu items
    -   **Order Management:** View all orders, update status
    -   **Reservation Management:** Add, edit,delete ,confirm, or cancel reservations
    -   **User Management:** View and manage user accounts

### **8. Contact & About Pages**

-   Navigate to **About Us** to read restaurant information
-   Go to **Contact Us** and submit a message
-   Verify form validation works

### **9. Responsive Design**

-   Test the website on different screen sizes (mobile, tablet, desktop)
-   Verify all pages are responsive and functional on mobile devices

### **10. Language Support**

-   Switch between English and Finnish
-   Verify all text updates correctly

---

---

## 🗂️ Project Structure (2025)

Restaurant-Website/
├─ backend/
│ ├─ app.py # Flask backend
│ ├─ apidoc.json # API documentation
│ └─ api/ # API modules (v1, utils, etc.)
├─ frontend/
│ ├─ templates/
│ │ ├─ index.html # Home page
│ │ ├─ menu.html # Menu page
│ │ ├─ about.html # About Us
│ │ ├─ contact.html # Contact Us
│ │ ├─ cart.html # Cart
│ │ ├─ reservation.html # Reservation
│ │ ├─ order-confirmation.html # Order Confirmation
│ │ ├─ admin-interface.html # Admin dashboard
│ │ ├─ admin-menu.html # Admin menu management
│ │ ├─ admin-orders.html # Admin order management
│ │ ├─ admin-reservations.html # Admin reservation management
│ │ ├─ admin-users.html # Admin user management
│ │ └─ ...
│ └─ static/
│ ├─ css/
│ │ ├─ main.css
│ │ ├─ menu.css
│ │ ├─ cart.css
│ │ ├─ reservation.css
│ │ ├─ order-confirmation.css
│ │ └─ ...
│ ├─ js/
│ │ ├─ menu.js
│ │ ├─ cart.js
│ │ ├─ reservation.js
│ │ ├─ order-confirmation.js
│ │ └─ ...
│ └─ assets/
│ └─ revontulet_logo.png
├─ requirements.txt
├─ README.md
└─ .gitignore

---

## 🧪 Accessibility & Best Practices (Lighthouse)

Lighthouse accessibility and best practices scores for all main pages (as of Dec 2025):

| Page               | Accessibility | Best Practices |
| ------------------ | :-----------: | :------------: |
| Home               |     13/14     |      5/5       |
| Menu               |     19/19     |      5/5       |
| About Us           |     13/13     |      5/5       |
| Contact Us         |     13/14     |      5/5       |
| Cart               |     14/15     |      5/5       |
| Order Confirmation |     13/15     |      5/5       |
| Reservation        |     14/15     |      5/5       |
| Admin Menu         |     20/21     |      5/5       |

Screenshots of all Lighthouse reports are available in the project documentation folder or upon request.

---

## 📝 HTML & CSS Validation

All main pages and CSS files are validated using the W3C HTML Validator, CSS Validator, and the VS Code CSS validation extension. Validation screenshots and reports are included in the [`documentation/validation/`](documentation/validation/) folder.

**Validation Evidence:**

-   See [`documentation/validation/`](documentation/validation/) for screenshots of:
    -   HTML validation results for all main pages
    -   CSS validation results for all main stylesheets (e.g., `main.css`, `admin-interface.css`, etc.)

Each screenshot is named after the corresponding page or stylesheet for easy reference.

---

## 📄 Documentation

-   API documentation: see `backend/apidoc.json`
-   User and admin guides, validation evidence, and extra screenshots: see `documentation/`

---

## 👥 Authors

Irum Shehryar ,Kanwaljit Singh ,Farhan Ashraf ,Saba Akbar
