from flask import Flask, render_template, request, url_for,flash, redirect, session, jsonify
from models import products_collection, orders_collection, users_collection, messages_collection
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from flask import Response
from io import StringIO
import os
import csv
app = Flask(__name__)
CORS(app)


# Secret key for session management
app.secret_key = '1234'

# MongoDB connection
client = MongoClient("mongodb+srv://AmmarJaved:5y1eF5sQpWWO4ArT@cluster0.dvyrmls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["ecommerce"]


# Collections
contact_collection = db["contact"]
products_collection = db["products"]
orders_collection = db["orders"]
admins_collection = db["admins"]
settings_collection = db["settings"]


# Create default settings if not exists
if settings_collection.count_documents({}) == 0:
    settings_collection.insert_one({
        "site_name": "Loris Health Care",
        "site_email": "lorishealthcare@example.com",
        "contact_number": "+92 300 0000000",
        "address": "Lahore, Pakistan",
        "footer_note": "Copyright © Loris Health Care"
    })

# Create admin user if not exists
if admins_collection.count_documents({"username": "Ammar Javed"}) == 0:
    admins_collection.insert_one({
        "username": "Ammar Javed",
        "password": "2e4r5y7u"
    })

# Contact form API
@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()
    try:
        contact_collection.insert_one(data)
        return jsonify({"message": "Data saved"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

# Public API - Add product
@app.route("/products", methods=["POST"])
def add_product_public():
    data = request.get_json()
    try:
        products_collection.insert_one(data)
        return jsonify({"message": "Product added successfully"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

# Public API - Get products
@app.route("/products", methods=["GET"])
def get_products():
    try:
        products = list(products_collection.find({}, {"_id": 0}))
        return jsonify(products), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

# Submit order API
@app.route('/api/orders', methods=['POST'])
def submit_order():
    data = request.json
    print("Data received:", data)

    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    cart = data.get('cart', [])

    if not (name and phone and address and cart):
        return jsonify({"error": "Missing fields"}), 400

    # ---- Calculate subtotal ----
    subtotal = sum(float(item.get("price", 0)) * int(item.get("quantity", 1)) for item in cart)

    # ---- Delivery Charges ----
    delivery = 200 if subtotal < 2000 else 0

    total = subtotal + delivery

    order = {
        "name": name,
        "phone": phone,
        "address": address,
        "cart": cart,
        "subtotal": subtotal,
        "delivery": delivery,
        "total": total,
        "email": data.get("email", ""),
        "notes": data.get("notes", ""),
        "date": datetime.utcnow()
    }

    order_id = orders_collection.insert_one(order).inserted_id
    return jsonify({
        "message": "Order submitted",
        "order_id": str(order_id),
        "subtotal": subtotal,
        "delivery": delivery,
        "total": total
    }), 201

# Admin login
@app.route('/admin/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        admin = admins_collection.find_one({'username': username, 'password': password})
        if admin:
            session['admin_logged_in'] = True
            return redirect('/admin/dashboard')
        else:
            return render_template('login.html', error="Invalid username or password")
    return render_template('login.html')

# Dashboard
@app.route('/admin/dashboard')
def dashboard():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')

    total_orders = orders_collection.count_documents({})
    total_products = products_collection.count_documents({})
    total_users = orders_collection.distinct("email")
    total_messages = contact_collection.count_documents({})

    return render_template('dashboard.html',
        total_orders=total_orders,
        total_products=total_products,
        total_users=len(total_users),
        total_messages=total_messages
    )

# Orders
@app.route("/admin/orders")
def view_orders():
    try:
        orders = list(orders_collection.find().sort("date", -1))
    except Exception as e:
        print("Database error:", e)
        orders = []
    return render_template("admin_orders.html", orders=orders)

# Delete order
@app.route("/admin/delete_order/<order_id>", methods=["POST"])
def delete_order(order_id):
    orders_collection.delete_one({"_id": ObjectId(order_id)})
    return redirect(url_for("view_orders"))

# Export orders
@app.route("/admin/export_orders")
def export_orders():
    orders = list(orders_collection.find())

    def generate():
        data = StringIO()
        writer = csv.writer(data)
        writer.writerow(["Name", "Email", "Total", "Address", "Date"])
        for order in orders:
            writer.writerow([
                order.get("name", ""),
                order.get("email", ""),
                order.get("total", ""),
                order.get("address", ""),
                order.get("date", "")
            ])
        return data.getvalue()

    return Response(
        generate(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"}
    )

# ------------------ Manage Products ------------------
@app.route("/admin/products")
def view_products():
    products = list(products_collection.find())
    return render_template("admin_products.html", products=products)

@app.route("/admin/add_product", methods=["POST"])
def add_product():
    name = request.form.get("name")
    price = request.form.get("price")
    description = request.form.get("description")
    image = request.form.get("image")

    # Insert into MongoDB
    products_collection.insert_one({
        "name": name,
        "price": price,
        "description": description,
        "image": image
    })

    return redirect("/admin/products")  # redirect back to the product page

@app.route("/admin/delete_product/<product_id>", methods=["POST"])
def delete_product(product_id):
    products_collection.delete_one({"_id": ObjectId(product_id)})
    return redirect("/admin/products")

@app.route("/admin/edit_product/<product_id>", methods=["GET", "POST"])
def edit_product(product_id):
    if request.method == "POST":
        name = request.form.get("name")
        price = request.form.get("price")
        description = request.form.get("description")
        image = request.form.get("image") 

        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"name": name, "price": price, "description": description, "image": image}}
        )
        return redirect(url_for("view_products"))

    product = products_collection.find_one({"_id": ObjectId(product_id)})
    return render_template("edit_product.html", product=product)

# ------------------ Manage User ------------------
@app.route('/admin/users')
def admin_users():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')

    orders = db.orders.find()
    unique_users = {}

    for order in orders:
        print("Order Found:", order)  # Debugging
        email = order.get('email')
        if email and email not in unique_users:
            unique_users[email] = {
                'name': order.get('name', 'N/A'),
                'email': email,
                'phone': order.get('phone', 'N/A')
            }

    print("Final Users:", unique_users)  # Debugging
    return render_template('admin_users.html', users=list(unique_users.values()))
# ------------------ contact ------------------
@app.route('/contact-form', methods=['POST'])
def contact_form():
    data = request.get_json()
    print("Received data:", data)

    if not data:
        return jsonify({"error": "No data received"}), 400

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone", "")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "Missing fields"}), 400

    result = db.messages.insert_one({
        "name": name,
        "email": email,
        "phone": phone,
        "message": message,
        "submitted_at": datetime.utcnow()
    })

    print("Inserted ID:", result.inserted_id)
    return jsonify({"msg": "Message saved!"}), 200

# ------------------ meassage ------------------
@app.route('/admin/messages')
def admin_messages():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    
    messages = list(db.messages.find().sort('submitted_at', -1))
    return render_template('admin_messages.html', messages=messages)

# ------------------ setting ------------------
@app.route('/admin/settings', methods=['GET', 'POST'])
def admin_settings():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')

    settings = settings_collection.find_one()
    message = None

    if request.method == 'POST':
        # Site Info Update
        site_name = request.form.get('site_name')
        site_email = request.form.get('site_email')
        contact_number = request.form.get('contact_number')
        address = request.form.get('address')
        footer_note = request.form.get('footer_note')

        settings_collection.update_one({}, {
            "$set": {
                "site_name": site_name,
                "site_email": site_email,
                "contact_number": contact_number,
                "address": address,
                "footer_note": footer_note
            }
        })
        message = "Settings updated successfully."
        settings = settings_collection.find_one()

    return render_template('admin_settings.html', settings=settings, message=message)
# ------------------ change password ------------------
@app.route('/admin/change-password', methods=['POST'])
def change_password():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')

    old_password = request.form.get('old_password')
    new_password = request.form.get('new_password')

    admin = admins_collection.find_one()
    if admin["password"] != old_password:
        return jsonify({"error": "Old password is incorrect"}), 400

    admins_collection.update_one({}, {"$set": {"password": new_password}})
    return jsonify({"message": "Password changed successfully"}), 200


@app.route('/api/admin/total-products')
def total_products():
    total = products_collection.count_documents({})
    return jsonify({'total_products': total})

@app.route('/api/admin/total-orders')
def total_orders():
    total = orders_collection.count_documents({})
    return jsonify({'total_orders': total})

@app.route('/api/admin/total-users')
def total_users():
    total = users_collection.count_documents({})
    return jsonify({'total_users': total})

@app.route('/api/admin/total-messages')
def total_messages():
    total = messages_collection.count_documents({})
    return jsonify({'total_messages': total})
# ------------------ LOGOUT ------------------
@app.route('/admin/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect('/admin/login')

@app.route("/")
def home():
    return "Backend is running on Railway!"


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
