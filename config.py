import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
# config.py
SECRET_KEY = '1234'
MONGO_URI = 'mongodb+srv://AmmarJaved:5y1eF5sQpWWO4ArT@cluster0.dvyrmls.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
