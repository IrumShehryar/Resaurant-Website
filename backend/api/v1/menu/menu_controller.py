"""Controller helpers for the menu JSON API.

These functions are thin wrappers around the model and format API-style
JSON responses with proper HTTP status codes. They are invoked by the
Flask route functions in ``menu_routes.py``.
"""

from flask import jsonify,request,json
from .menu_model import list_all_menu_items, get_menu_by_id, add_menu_item, update_menu_item ,delete_menu_item
from api.utils.simple_errors import simple_errors
def get_menu():
    """
    Controller: GET /api/v1/menu
    
    Fetches all menu items from the database and returns them as JSON.
    Converts MongoDB's _id field to id field for frontend compatibility.
    
    Process:
    1. Call model function to get all MenuItem objects from MongoDB
    2. Convert MongoEngine QuerySet to JSON
    3. Loop through each item and convert _id.$oid to id (string)
    4. Return JSON array with HTTP 200 status
    
    Returns:
        tuple: (JSON response with all items, HTTP 200)
               Response format: [
                   {
                       "_id": {...},
                       "id": "691211b751476ba3fc35b9f5",
                       "name": "Aurora Bites",
                       "price": 5.50,
                       ...
                   }
               ]
    """
    items = list_all_menu_items()
    items_json = json.loads(items.to_json())
    for item in items_json:
        item['id'] = str(item['_id']['$oid'])
    return jsonify(items_json), 200


def get_menu_item_controller(item_id):
    """
    Controller: GET /api/v1/menu/<item_id>
    
    Fetches a single menu item by ID and returns it as JSON.
    Handles errors with appropriate HTTP status codes.
    
    Process:
    1. Try to fetch the item from database by ID
    2. If fetch fails (malformed ID), return 400 with error message
    3. If item not found, return 400 with "not found" message
    4. Convert _id.$oid to id (string) for frontend
    5. Return JSON item with HTTP 200 status
    
    Args:
        item_id (str): The MongoDB ObjectId from the URL (e.g., "691211b751476ba3fc35b9f5")
    
    Returns:
        tuple: (JSON response, HTTP status code)
               - (item JSON, 200) if item found
               - (error dict, 400) if malformed input or not found
    
    Example responses:
        Success (200): {"_id": {...}, "id": "...", "name": "Aurora Bites", ...}
        Error (400): {"error": "Item not found"}
    """
    try:
        item = get_menu_by_id(item_id)   
    except:
        return {"error":"malformed input"},400

    if not item:
         return {"error": "Item not found"},400
    
    item_json = json.loads(item.to_json())
    item_json["id"]=str(item_json["_id"]["$oid"])
       
    return jsonify(item_json),200

@simple_errors  
def create_menu_item_controller():
    """
    Controller: POST /api/v1/menu
    
    Creates a new menu item from JSON request body.
    
    Process:
    1. Extract JSON from HTTP request
    2. Call model function to create and save item to database
    3. Return the created item as JSON with HTTP 200
    
    Request body example:
        {
            "name": "Aurora Bites",
            "description": "Crispy potato bites...",
            "price": 5.50,
            "category": "starter",
            "image": "url...",
            "dietary": ["vegetarian"],
            "allergens": ["milk"],
            "days_of_week": ["Monday", "Tuesday", ...],
            "active": true
        }
    
    Returns:
        tuple: (JSON of created item, HTTP 200)
               Response includes the MongoDB _id assigned by database
    """
    item = add_menu_item(request.get_json())
    return item.to_json(),200

@simple_errors
def update_menu_item_controller(item_id):
    """
    Controller: PUT /api/v1/menu/<item_id>
    
    Updates an existing menu item with new data from request body.
    Only provided fields are updated (partial update).
    
    Process:
    1. Try to find and update the item with new data
    2. If item not found or error occurs, return 404 with error message
    3. Return updated item as JSON with HTTP 200
    
    Args:
        item_id (str): The MongoDB ObjectId from the URL
    
    Request body example (partial update):
        {
            "price": 7.99,
            "name": "Updated Name"
        }
        Only price and name will be updated, other fields unchanged.
    
    Returns:
        tuple: (JSON of updated item, HTTP status code)
               - (item JSON, 200) if successful
               - (error dict, 404) if item not found or update fails
    
    Example responses:
        Success (200): {"_id": {...}, "id": "...", "price": 7.99, "name": "Updated Name", ...}
        Error (404): {"error": "Item not found"}
    """
    try:
        item = update_menu_item(item_id,request.get_json())
        return item.to_json(),200
    except:
          return {"error": "Item not found"}, 404

@simple_errors
def delete_menu_item_controller(item_id):
    """
    Controller: DELETE /api/v1/menu/<item_id>
    
    Deletes a menu item from the database.
    
    Process:
    1. Try to delete the item from database by ID
    2. If item not found or error occurs, return 404 with error message
    3. Return success message with HTTP 200
    
    Args:
        item_id (str): The MongoDB ObjectId from the URL
    
    Returns:
        tuple: (response dict, HTTP status code)
               - ({"message": "Item deleted successfully"}, 200) if successful
               - ({"error": "Item not found"}, 404) if item doesn't exist
    
    Example responses:
        Success (200): {"message": "Item deleted successfully"}
        Error (404): {"error": "Item not found"}
    """
    try:
        result = delete_menu_item(item_id)
        return result,200
    except:
        return {"error":"Item not found"},404