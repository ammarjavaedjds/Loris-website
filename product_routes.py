from flask import Blueprint, request, jsonify
from app import mongo
from models import products_collection,orders_collection,messages_collection,users_collection

product_bp = Blueprint('product', __name__)

# Add Product
@product_bp.route('/add', methods=['POST'])
def add_product():
    data = request.json
    name = data.get('name')
    price = data.get('price')
    description = data.get('description')
    
    if not name or not price:
        return jsonify({'error': 'Name and price are required'}), 400
    
    mongo.db.products.insert_one({
        'name': name,
        'price': price,
        'description': description
    })
    
    return jsonify({'message': 'Product added successfully'}), 201

# Get All Products
@product_bp.route('/', methods=['GET'])
def get_products():
    products = list(mongo.db.products.find())
    for p in products:
        p['_id'] = str(p['_id'])  # ObjectId to string
    return jsonify(products)

@product_bp.route('/api/admin/total-products')
def total_products():
    total = products_collection.count_documents({})
    return jsonify({'total_products': total})

@product_bp.route('/api/admin/total-orders')
def total_orders():
    total = orders_collection.count_documents({})
    return jsonify({'total_orders': total})

@product_bp.route('/api/admin/total-users')
def total_users():
    total = users_collection.count_documents({})
    return jsonify({'total_users': total})

@product_bp.route('/api/admin/total-messages')
def total_messages():
    total = messages_collection.count_documents({})
    return jsonify({'total_messages': total})