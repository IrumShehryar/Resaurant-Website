"""
Database connection utility for MongoDB using mongoengine.
"""
from mongoengine import connect
import os

def mongo_connect():
    """
    Connects to MongoDB using environment variables DB_NAME and DATABASE_URL.
    Returns:
        connection: mongoengine connection object if successful, None otherwise.
    """
    try:
        connection = connect(
            db=os.getenv("DB_NAME"),
            host=os.getenv("DATABASE_URL")
        )
        print("DB connected successfully")
        return connection
    except Exception as e:
        print("Connection to db failed:", str(e))