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

/**
 * Create a modal manager for handling modal open/close operations
 * Used by admin.js for the admin-interface modal
 */
export function createModalManager() {
    return {
        open(modal) {
            modal.style.display = 'block'
        },
        setupCloseButton(closeBtn, modal) {
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none'
                })
            }
        },
        setupBackdropClick(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none'
                }
            })
        }
    }
}
