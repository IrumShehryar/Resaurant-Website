# Revontulet Flamehouse — Restaurant Website

Full stack project  
**Frontend:** HTML / CSS / JavaScript  
**Backend:** Python (Flask) + MongoDB

## ✨ Project idea

A restaurant website inspired by the Northern Lights (“Revontulet”), with a warm “flamehouse” vibe. Users can browse the menu, add items to a cart, and place orders; admins manage menu items, reservations, users, and orders.

---

## 🚀 Quick Start

1. **Get the code**
    ```sh
    git clone https://github.com/IrumShehryar/Restaurant-Website.git
    cd Restaurant-Website
    ```
2. **Create & activate a virtual environment**
    - Windows:
        ```sh
        python -m venv .venv
        .\.venv\Scripts\activate
        ```
    - macOS/Linux:
        ```sh
        python3 -m venv .venv
        source .venv/bin/activate
        ```
3. **Install dependencies**
    ```sh
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    ```
4. **Run the Flask app**
    ```sh
    python backend/app.py
    ```
    Then open http://127.0.0.1:5000 in your browser.

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

Irum Shehryar and team
