export function renderTable(items,columns,tbody){

    if(items.length === 0)
    {
         tbody.innerHTML = '<tr><td colspan="' + (columns.length+1) + '">No items yet</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(item =>`
        <tr>
            ${columns.map(col => `<td>${item[col]}</td>`).join('')}
            
            <td>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');
}