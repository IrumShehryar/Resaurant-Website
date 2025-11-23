import { getAllMenu, getMenuById } from "./services/menuService.js";
import fetchData  from "./utils/fetchData.js";
import {apiUrl} from "./utils/config.js"

const modal = document.getElementById('admin-modal')
const closeBtn = document.querySelector('.modal-close')
const addBtn = document.getElementById('btn-add-item')
const form = document.getElementById('item-form')
const menuTbody = document.getElementById('menu-tbody')

let currentEditId = null

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification')
    notification.textContent = message
    notification.className = `notification ${type}`
    notification.style.display = 'block'
    
    setTimeout(() => {
        notification.style.display = 'none'
    }, 3000)
}

async function loadMenuItems(){
    try{
        const items = await getAllMenu()
        console.log('Data received:', items)
        renderTable(items)
    }catch(error){
        console.error('Error loading menu:', error);
        menuTbody.innerHTML = '<tr><td colspan="5">Error loading menu</td></tr>'
    }
}
function renderTable(items){
    if(items.length === 0)
    {
         menuTbody.innerHTML = '<tr><td colspan="5">No items yet</td></tr>';
        return;
    }
    menuTbody.innerHTML = items.map(item =>`
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>€${item.price}</td>
            <td>${item.dietary ? item.dietary.join(', ') : '-'}</td>
            <td>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}


addBtn.addEventListener('click',()=>{
    currentEditId = null
    form.reset()
    document.getElementById('form-title').textContent = "Add New Item"
    modal.style.display='block'
})

closeBtn.addEventListener('click',()=>{
    modal.style.display='none'
})

window.addEventListener('click', (e) =>{
    if(e.target === modal){
        modal.style.display = 'none'
    }
})
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
            document.querySelector('input[name="days_of_week"]').value = item.days_of_week ? item.days_of_week.join(', ') : ''
            
            modal.style.display = 'block'
        }

    }

})

form.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const formData = new FormData(form)
    
    const dietaryArray = Array.from(document.querySelectorAll('input[name="dietary"]:checked'))
        .map(checkbox => checkbox.value)
    
    const allergens = formData.get('allergens')
        .split(',')
        .map(item => item.trim())
        .filter(item => item)

     const ingredients = formData.get('ingredients')
        .split(',')
        .map(item => item.trim())
        .filter(item => item);

    const days_of_week = formData.get('days_of_week')
        .split(',')
        .map(item => item.trim())
        .filter(item => item);

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

        let url,options
        if(currentEditId){
            url =apiUrl(`menu/${currentEditId}`)
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(itemData)

            }
         } else{

            url = apiUrl('menu')
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            }
        }
        await fetchData(url,options)
        modal.style.display= 'none'
        form.reset()
        loadMenuItems();
        showNotification('Item saved successfully!')
    } catch(error) {
        showNotification('Error saving item')
    }
})

menuTbody.addEventListener('click',async(e) =>{
    if(e.target.classList.contains('btn-delete')){
        const row = e.target.closest('tr')
        const item = await getItemFromRow(row)

        if(item && confirm(`Are you sure you want to delete "${item.name}"?`)){
            try{
                await fetchData(apiUrl(`menu/${item.id}`),{
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                })
                loadMenuItems()
                showNotification('Item deleted successfully!')
            }catch(error){
                showNotification('Error Deleting item')
            }
        
        }
    }
})
loadMenuItems();