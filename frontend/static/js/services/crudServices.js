/**
 * Generic CRUD Service Factory
 * 
 * Creates reusable CRUD managers for any API endpoint.
 * Eliminates code duplication across admin.js, orders.js, reservations.js, etc.
 * Handles all HTTP operations: GET, POST, PUT, DELETE with proper headers.
 * 
 * Architecture Pattern: Factory function returns an object with 5 methods
 * This allows each page to create its own manager for its endpoint.
 * 
 * Usage Examples:
 * 
 * In admin.js:
 *   const menuCrud = createCrudManager('menu')
 *   const allItems = await menuCrud.getAll()
 *   const item = await menuCrud.getById('item123')
 *   await menuCrud.create({ name: "Salmon", price: 25.99 })
 *   await menuCrud.update('item123', { price: 28.99 })
 *   await menuCrud.deleteItem('item123')
 * 
 * In orders.js:
 *   const ordersCrud = createCrudManager('orders')
 *   const orders = await ordersCrud.getAll()
 *   await ordersCrud.create({ customer: "John", items: [...] })
 * 
 * In reservations.js:
 *   const reservationsCrud = createCrudManager('reservations')
 *   const reservation = await reservationsCrud.getById('res456')
 */
import fetchData from '../utils/fetchData.js'
import {apiUrl} from '../utils/config.js'

export function createCrudManager(endpoint){
    
    /**
     * GET all items from endpoint
     * @returns {Promise} Array of all items
     */
    async function getAll(){
        return fetchData(apiUrl(endpoint))
    }

    /**
     * GET single item by ID
     * @param {string} id - Item ID
     * @returns {Promise} Single item object
     */
    async function getById(id){
        return fetchData(apiUrl(`${endpoint}/${id}`))
    }

    /**
     * POST create new item
     * @param {object} data - Item data to create
     * @returns {Promise} Created item with ID
     */
    async function create(data){
        return fetchData(apiUrl(endpoint),{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        })
    }

    /**
     * PUT update existing item
     * @param {string} id - Item ID
     * @param {object} data - Updated item data
     * @returns {Promise} Updated item
     */
    async function update(id,data){
        return fetchData(apiUrl(`${endpoint}/${id}`),{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
    }

    /**
     * DELETE remove item
     * @param {string} id - Item ID
     * @returns {Promise} Confirmation response
     */
    async function deleteItem(id){
        return fetchData(apiUrl(`${endpoint}/${id}`), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
    }

    // Return object with all CRUD methods
    // Use deleteItem not delete because delete is reserved keyword
    return {
        getAll,
        getById,
        create,
        update,
        deleteItem
    }
}