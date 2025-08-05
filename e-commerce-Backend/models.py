# models.py
from pymongo import MongoClient
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client['ecommerce']

products_collection = db['products']
orders_collection = db['orders']
users_collection = db['users']
messages_collection = db['messages']
admin_users_collection = db['admin_users']
