"""Controller helpers for the menu JSON API.

These functions are thin wrappers around the model and format API-style
JSON responses with proper HTTP status codes. They are invoked by the
Flask route functions in ``menu_routes.py``.
"""

from flask import jsonify,request,json
from .reservation_model import list_all_reservations, get_reservation_by_id, add_reservation, update_reservation ,delete_reservation
from api.utils.simple_errors import simple_errors
def get_reservation():

    items = list_all_reservations()
    items_json = json.loads(items.to_json())
    for item in items_json:
        item['id'] = str(item['_id']['$oid'])
    return jsonify(items_json), 200



def get_reservation_controller(reservation_id):
    
   
    try:
        item = get_reservation_by_id(reservation_id)   
    except:
        return {"error":"malformed input"},400

    if not item:
         return {"error": "Item not found"},400
    
    item_json = json.loads(item.to_json())
    item_json["id"]=str(item_json["_id"]["$oid"])
       
    return jsonify(item_json),200

@simple_errors  
def create_reservation_controller():
    
    item = add_reservation(request.get_json())
    return item.to_json(),200

@simple_errors
def update_reservation_controller(reservation_id):
   
    try:
        item = update_reservation(reservation_id,request.get_json())
        return item.to_json(),200
    except:
          return {"error": "Item not found"}, 404

@simple_errors
def delete_reservation_controller(reservation_id):
    
    try:
        result = delete_reservation(reservation_id)
        return result,200
    except:
        return {"error":"Item not found"},404