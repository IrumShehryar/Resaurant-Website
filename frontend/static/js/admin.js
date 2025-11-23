import { getAllMenu, getMenuById } from "./services/menuService.js";
const modal = document.getElementById('admin-modal')
const closeBtn = document.querySelector('.modal-close')
const addBtn = document.getElementById('btn-add-item')
const form = document.getElementById('item-form')
const menuTbody = document.getElementById('menu-tbody')

let currentEditId = null

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



loadMenuItems();