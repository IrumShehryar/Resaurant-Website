/**
 * Reusable utility functions for table management
 * Used across admin.js, order-management.js, and other pages
 */

/**
 * Show notification messages (success/error)
 * Generic - works on any page
 */
export function showNotification(message, type = 'success', notificationElement) {
    notificationElement.textContent = message
    notificationElement.className = `notification ${type}`
    notificationElement.style.display = 'block'
    
    setTimeout(() => {
        notificationElement.style.display = 'none'
    }, 3000)
}

