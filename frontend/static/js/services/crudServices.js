/**
 * Generic CRUD Service
 * 
 * Factory function that creates a CRUD manager for any API endpoint.
 * Handles all HTTP operations (GET, POST, PUT, DELETE) for RESTful APIs.
 * 
 * Usage:
 *   const menuCrud = createCrudManager('menu')
 *   const items = await menuCrud.getAll()
 *   await menuCrud.create({ name: "Salmon", price: 25.99 })
 *   await menuCrud.update(id, { price: 28.99 })
 *   await menuCrud.delete(id)
 */
import fetchData from '../utils/fetchData.js'
import {apiUrl} from '../utils/config.js'

export function createCrudManager(endpoint){
    async function getAll(){
        return fetchData(apiUrl(endpoint))
    }


async function getbyId(id){
    return fetchData(apiUrl(`${endpoint}/${id}`))
}

async function create(data){
    return fetchData(apiUrl(endpoint),{
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)

    })
}

async function update(id,data){
    return fetchData(apiUrl(`${endpoint}/${id}`),{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

async function deleteItem(id){
    return fetchData(apiUrl(`${endpoint}/${id}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
}

return {
    getAll,
    getbyId,
    create,
    update,
    deleteItem
}
}