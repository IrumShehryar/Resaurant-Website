"""Mock menu model for the API.

This module provides in-memory mock data for development and two
small helper functions used by the controllers:

- list_all_menu_items() -> list[dict]
- get_menu_by_id(item_id: int) -> dict|None

The dataset is intentionally small and self-contained so the project can
run without a database during development and testing.
"""
from mongoengine import Document , StringField, FloatField, ListField, BooleanField, ValidationError
from backend.api.utils.validators import validate_menu_item_fields
from bson import ObjectId
import re
# Mock data (16 items) for Revontulet Flamehouse

class MenuItem(Document):
    
    name =  StringField (required = True,min_length=3, max_length=100)
    description= StringField(max_length=500)
    price = FloatField(required= True, min_value=0.01,max_value=999)
    category = StringField(required = True, choices = ["starter","main","dessert","side","drink","special"])
    image = StringField(max_length=500)
    dietary = ListField(StringField(choices =["vegetarian","vegan","non-vegetarian","gluten-free","dairy-free","pescatarian","sugar-free","nut-free","keto-friendly","alcoholic","non-alcoholic"]))
    allergens = ListField(StringField(max_length=200))
    ingredients = ListField(StringField(max_length=200))
    days_of_week = ListField(StringField(choices =["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]))
    active = BooleanField(default=True)
    
    def clean(self):
        """
        Delegates all menu item validation to validate_menu_item_fields in validators.py
        """
        validate_menu_item_fields(
            name=self.name,
            price=self.price,
            category=self.category,
            dietary=self.dietary,
            allergens=self.allergens,
            ingredients=self.ingredients,
            days_of_week=self.days_of_week,
            active=self.active,
            description=self.description,
            image=self.image
        )
    

def list_all_menu_items():
    """
    Retrieve all menu items from the MongoDB database.
    
    This function queries the MenuItem collection and returns all documents.
    Called by the controller to fetch the complete menu.
    
    Returns:
        QuerySet: MongoEngine QuerySet containing all MenuItem objects.
                  Each item is a MongoDB document with fields: name, price, 
                  category, description, dietary, allergens, days_of_week, active.
    
    Example:
        items = list_all_menu_items()
        for item in items:
            print(item.name, item.price)
    """
    return MenuItem.objects()


def get_menu_by_id(item_id):
    """
    Find a single menu item by its MongoDB ObjectId.
    
    Converts the string item_id to a MongoDB ObjectId, then searches the
    database. Returns None if the item is not found or if the conversion fails.
    
    Args:
        item_id (str): The MongoDB ObjectId as a string (e.g., "691211b751476ba3fc35b9f5")
    
    Returns:
        MenuItem | None: The MenuItem object if found, otherwise None.
    
    Example:
        item = get_menu_by_id("691211b751476ba3fc35b9f5")
        if item:
            print(item.name)
        else:
            print("Item not found")
    """
    try:
        return MenuItem.objects.get(id = ObjectId(item_id))
    except:
        return None
  
def add_menu_item(item_data):
    """
    Create and save a new menu item to the database.
    
    Extracts fields from the incoming request data using .get() to provide
    defaults if keys are missing. Creates a new MenuItem object and saves it
    to MongoDB.
    
    Args:
        item_data (dict): JSON data from the HTTP request containing:
                         - name (str, required): Item name
                         - description (str): Item description
                         - price (float): Item price
                         - category (str): One of ["starter", "main", "dessert", "side", "drink", "special"]
                         - image (str): URL to item image
                         - dietary (list): List of dietary labels (e.g., ["vegetarian", "vegan"])
                         - allergens (list): List of allergens (e.g., ["gluten", "dairy"])
                         - days_of_week (list): Days this item is available
                         - active (bool): Whether item is currently active (default: True)
    
    Returns:
        MenuItem: The newly created MenuItem object with MongoDB _id assigned.
    
    Example:
        data = {
            "name": "Aurora Bites",
            "price": 5.50,
            "category": "starter",
            "dietary": ["vegetarian"],
            "allergens": ["milk"]
        }
        new_item = add_menu_item(data)
        print(new_item.id)  # MongoDB ObjectId
    """
    new_item = MenuItem(
        name = item_data.get('name'),
        description = item_data.get('description'),
        price = item_data.get('price'),
        category = item_data.get('category'),
        image = item_data.get('image'),
        dietary = item_data.get('dietary',[]),
        allergens = item_data.get('allergens',[]),
        ingredients = item_data.get('ingredients', []),
        days_of_week = item_data.get('days_of_week',[]),
        active = item_data.get('active',True)
        
    )
    new_item.save()
    return new_item

def update_menu_item(item_id,item_data):
    """
    Update an existing menu item with new data.
    
    Finds the item by ID and updates only the fields provided in item_data.
    Uses MongoEngine's .update(**item_data) which performs a partial update
    (only specified fields are changed, others remain unchanged).
    
    Args:
        item_id (str): The MongoDB ObjectId as a string
        item_data (dict): Dictionary of fields to update (e.g., {"price": 12.99})
    
    Returns:
        MenuItem: The updated MenuItem object.
    
    Raises:
        DoesNotExist: If no item with that ID exists (caught by controller).
    
    Example:
        update_data = {"price": 12.99, "name": "Updated Name"}
        updated_item = update_menu_item("691211b751476ba3fc35b9f5", update_data)
    """
    # FIX: Added ObjectId() conversion for item_id
    # ISSUE: String ID must be converted to MongoDB ObjectId for database query
    item = MenuItem.objects.get(id=ObjectId(item_id))
    # Use setattr to update fields and enforce validation on save
    # setattr(object, name, value) sets object.name = value dynamically
    for key, value in item_data.items():
        setattr(item, key, value)
    item.save()  # This will call clean() and validate all fields
    return item

def delete_menu_item(item_id):
    """
    Delete a menu item from the database.
    
    Finds the item by ID and removes it from MongoDB completely.
    
    Args:
        item_id (str): The MongoDB ObjectId as a string
    
    Returns:
        dict: A success message dictionary {"message": "Item deleted successfully"}
    
    Raises:
        DoesNotExist: If no item with that ID exists (caught by controller).
    
    Example:
        result = delete_menu_item("691211b751476ba3fc35b9f5")
        print(result)  # {"message": "Item deleted successfully"}
    """
    # FIX: Added ObjectId() conversion for item_id
    # ISSUE: String ID must be converted to MongoDB ObjectId for database query
    MenuItem.objects.get(id=ObjectId(item_id)).delete()
    return{"message": "Item deleted successfully"}