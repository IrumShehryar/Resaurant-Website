import { getAllMenu, getMenuById } from "./services/menuService.js";
import fetchData  from "./utils/fetchData.js";
import {apiUrl} from "./utils/config.js"
import { validateMenuItemForm } from './utils/validation.js'
import { showNotification, createModalManager } from './utils/tableManager.js'
import { renderTable } from "./utils/tableRenderer.js";
import { createCrudManager} from './services/crudServices.js'

const modal = document.getElementById('admin-modal')
const closeBtn = document.querySelector('.modal-close')
const addBtn = document.getElementById('btn-add-item')
const form = document.getElementById('item-form')
const menuTbody = document.getElementById('menu-tbody')
const notificationElement = document.getElementById('notification')
const modalManager = createModalManager()
const menuCrud = createCrudManager('menu')

let currentEditId = null

async function loadMenuItems(){
    try{
        const items = await getAllMenu()
        console.log('Data received:', items)
        renderTable(items, ['name', 'category', 'price', 'dietary'], menuTbody)
    }catch(error){
        console.error('Error loading menu:', error);
        menuTbody.innerHTML = '<tr><td colspan="5">Error loading menu</td></tr>'
    }
}


addBtn.addEventListener('click',()=>{
    currentEditId = null
    form.reset()
    document.getElementById('form-title').textContent = "Add New Item"
    modalManager.open(modal)
})

modalManager.setupCloseButton(closeBtn, modal)
modalManager.setupBackdropClick(modal)
async function getItemFromRow(row){
    const itemName = row.cells[0].textContent
    const items = await getAllMenu()
    const item = items.find(i=>i.name === itemName)
    return item
}

menuTbody.addEventListener('click',async(e)=>{
    if (e.target.classList.contains('btn-edit')){
         const row = e.target.closest('tr')
         const item = await getItemFromRow(row)
        if(item){
            currentEditId = item.id
            document.getElementById('form-title').textContent = 'Edit Item'

            form.name.value = item.name
            form.price.value = item.price
            form.category.value = item.category;
            form.description.value = item.description || '';
            form.image.value = item.image || '';
            form.allergens.value = item.allergens ? item.allergens.join(', ') : '';
            form.ingredients.value = item.ingredients ? item.ingredients.join(', ') : '';

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

form.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const formData = new FormData(form)
    
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
    try{
        if(currentEditId){
           await menuCrud.update(currentEditId,itemData)
        }else{
            await menuCrud.create(itemData)
        }

        modal.style.display= 'none'
        form.reset()
        loadMenuItems();
        showNotification('Item saved successfully!', 'success', notificationElement)
    } catch(error) {
        showNotification('Error saving item', 'error', notificationElement)
    }
})

menuTbody.addEventListener('click',async(e) =>{
    if(e.target.classList.contains('btn-delete')){
        const row = e.target.closest('tr')
        const item = await getItemFromRow(row)

        if(item && confirm(`Are you sure you want to delete "${item.name}"?`)){
            try{
                await menuCrud.deleteItem(item.id)
                loadMenuItems()
                showNotification('Item deleted successfully!', 'success', notificationElement)
            }catch(error){
                showNotification('Error Deleting item', 'error', notificationElement)
            }
        
        }
    }
})
loadMenuItems();