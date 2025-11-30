/**
 * ADMIN INTERFACE - Menu Management
 * 
 * Uses refactored reusable utilities:
 * - renderTable() from tableRenderer.js (generic table rendering)
 * - createCrudManager() from crudServices.js (generic CRUD operations)
 * - createModalManager() from tableManager.js (modal open/close)
 * - showNotification() from tableManager.js (toast messages)
 * 
 * Architecture:
 * - In-memory cache (allItems) eliminates redundant API calls
 * - data-id attributes on table rows enable fast item lookup
 * - Single responsibility: menu management controller
 * 
 * Performance Optimization:
 * - When page loads, all items fetched ONCE and cached in allItems
 * - Edit/Delete operations use cache instead of calling API again
 * - Cache refreshed after each create/update/delete operation
 * - Result: Instant response when clicking Edit/Delete buttons
 * 
 * Reusable Pattern:
 * To build orders.js or reservations.js, copy this file and change:
 *   1. Endpoint: createCrudManager('orders')
 *   2. Columns: renderTable(items, ['id', 'customer', 'total', 'status'], ...)
 *   3. Form fields: form.customerName, form.orderDate, etc.
 */

import { getAllMenu, getMenuById } from "../services/menuService.js";
import fetchData  from "../utils/fetchData.js";
import {apiUrl} from "../utils/config.js"
import { validateMenuItemForm } from '../utils/validation.js'
import { showNotification, createModalManager } from '../utils/tableManager.js'
import { renderTable } from "../utils/tableRenderer.js";
import { createCrudManager} from '../services/crudServices.js'

// ========== DOM Elements ==========
const modal = document.getElementById('admin-modal')
const closeBtn = document.querySelector('.modal-close')
const addBtn = document.getElementById('btn-add-item')
const form = document.getElementById('item-form')
const menuTbody = document.getElementById('menu-tbody')
const notificationElement = document.getElementById('notification')

// ========== Utilities Initialization ==========
const modalManager = createModalManager()
const menuCrud = createCrudManager('menu')

// ========== State Management ==========
let currentEditId = null
// In-memory cache to avoid redundant API calls
// Populated on page load, refreshed after each operation
let allItems = []

/**
 * Load all menu items and populate table
 * Called on page load and after each create/update/delete
 * 
 * Performance: Caches all items in memory (allItems) to avoid
 * fetching full dataset when user clicks Edit/Delete
 */
async function loadMenuItems(){
    try{
        const items = await getAllMenu()
        // Cache items for fast lookup without API calls
        allItems = items
        console.log('Data received:', items)
        
        // Use generic renderTable with configurable columns
        // Columns control what shows in table, but full item data available in cache
        renderTable(items, ['name', 'category', 'price', 'dietary'], menuTbody)
    }catch(error){
        console.error('Error loading menu:', error);
        menuTbody.innerHTML = '<tr><td colspan="5">Error loading menu</td></tr>'
    }
}


// ========== Event Listeners ==========

/**
 * Add button: Open modal to create new item
 */
addBtn.addEventListener('click',()=>{
    currentEditId = null
    form.reset()
    document.getElementById('form-title').textContent = "Add New Item"
    modalManager.open(modal)
})

// Setup modal closing mechanisms
modalManager.setupCloseButton(closeBtn, modal)
modalManager.setupBackdropClick(modal)

/**
 * Get item from cached data using row's data-id attribute
 * 
 * PERFORMANCE: Instead of fetching all items again, search the cache
 * data-id stored in HTML by renderTable() enables instant lookup
 * 
 * @param {HTMLElement} row - Table row element
 * @returns {object} Item from cache
 */
async function getItemFromRow(row){
   const itemId = row.dataset.id
    return allItems.find(i => i.id === itemId)
}

/**
 * Edit button: Load item into form for editing
 * Uses cached item to avoid API call
 */
menuTbody.addEventListener('click',async(e)=>{
    if (e.target.classList.contains('btn-edit')){
         const row = e.target.closest('tr')
         const item = await getItemFromRow(row)  // Instant - from cache!
        if(item){
            currentEditId = item.id
            document.getElementById('form-title').textContent = 'Edit Item'

            // Populate form with all item fields (even fields not shown in table)
            form.name.value = item.name
            form.price.value = item.price
            form.category.value = item.category;
            form.description.value = item.description || '';
            form.image.value = item.image || '';
            form.allergens.value = item.allergens ? item.allergens.join(', ') : '';
            form.ingredients.value = item.ingredients ? item.ingredients.join(', ') : '';

            // Populate checkboxes for multi-select fields
            document.querySelectorAll('input[name="dietary"]').forEach(checkbox=>{
                checkbox.checked = item.dietary && item.dietary.includes(checkbox.value)
            })
            document.querySelector('input[name="active"]').checked = item.active || false
            document.querySelectorAll('input[name="days_of_week"]').forEach(checkbox=>{
                checkbox.checked = item.days_of_week && item.days_of_week.includes(checkbox.value)
            })
            
            modal.style.display = 'block'
        }

    }

})

/**
 * Form submission: Create or update item
 * Uses generic menuCrud.create() and menuCrud.update() methods
 * Refreshes cache after operation completes
 */
form.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const formData = new FormData(form)
    
    // ========== Validate form ==========
    const name = formData.get('name')
    const price = parseFloat(formData.get('price'))
    const category = formData.get('category')
    const dietaryArray = Array.from(document.querySelectorAll('input[name="dietary"]:checked'))
        .map(checkbox => checkbox.value)
    
    const validation = validateMenuItemForm(name, price, category, dietaryArray)
    if (!validation.valid) {
        showNotification(validation.message, 'error', notificationElement)
        return
    }
    
    // ========== Parse multi-select fields ==========
    const allergens = formData.get('allergens')
        .split(',')
        .map(item => item.trim())
        .filter(item => item)

    const ingredients = formData.get('ingredients')
        .split(',')
        .map(item => item.trim())
        .filter(item => item);

    const days_of_week = Array.from(document.querySelectorAll('input[name="days_of_week"]:checked'))
        .map(checkbox => checkbox.value)

    // ========== Build item object ==========
    const itemData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description'),
        image: formData.get('image'),
        allergens: allergens,
        ingredients: ingredients,
        dietary: dietaryArray,
        active: document.querySelector('input[name="active"]').checked,
        days_of_week: days_of_week
    };
    
    // ========== Save to database using generic CRUD ==========
    try{
        if(currentEditId){
           // Update existing item using generic menuCrud.update()
           await menuCrud.update(currentEditId,itemData)
        }else{
            // Create new item using generic menuCrud.create()
            await menuCrud.create(itemData)
        }

        // ========== Post-save cleanup ==========
        modal.style.display = 'none'
        form.reset()
        
        // Refresh cache and table
        loadMenuItems();
        
        // Show success notification
        showNotification('Item saved successfully!', 'success', notificationElement)
    } catch(error) {
        showNotification('Error saving item', 'error', notificationElement)
    }
})

/**
 * Delete button: Remove item from database
 * Asks for confirmation before deletion
 */
menuTbody.addEventListener('click',async(e) =>{
    if(e.target.classList.contains('btn-delete')){
        const row = e.target.closest('tr')
        const item = await getItemFromRow(row)

        if(item && confirm(`Are you sure you want to delete "${item.name}"?`)){
            try{
                // Delete using generic menuCrud.deleteItem()
                await menuCrud.deleteItem(item.id)
                
                // Refresh cache and table
                loadMenuItems()
                
                // Show success notification
                showNotification('Item deleted successfully!', 'success', notificationElement)
            }catch(error){
                showNotification('Error Deleting item', 'error', notificationElement)
            }
        
        }
    }
})

// ========== Initialize Page ==========
// Load menu items on page load
loadMenuItems();