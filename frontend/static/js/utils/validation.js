export function validateMenuItemForm(name, price, category, dietaryArray) {
    if (!name || name.length < 3) {
        return { valid: false, message: 'Name must be at least 3 characters' }
    }
    
    if (price <= 0) {
        return { valid: false, message: 'Price must be greater than 0' }
    }
    
    if (!category) {
        return { valid: false, message: 'Please select a category' }
    }
    
    if (dietaryArray.length === 0) {
        return { valid: false, message: 'Select at least one dietary option' }
    }
    
    return { valid: true }
}