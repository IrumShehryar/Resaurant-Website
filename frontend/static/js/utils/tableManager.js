/**
 * Table Management Utilities
 * 
 * Collection of reusable functions for modal and notification management.
 * Used across admin.js, orders.js, reservations.js, and any CRUD interface.
 * 
 * Includes:
 * - Modal management (open, close, backdrop click)
 * - Toast notifications (success, error messages)
 */
/**
 * Display toast notification (auto-hide after 3 seconds)
 * 
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error' (controls styling)
 * @param {HTMLElement} notificationElement - Target element for notification
 * 
 * Usage in admin.js:
 *   showNotification('Item saved successfully!', 'success', notificationElement)
 *   showNotification('Error saving item', 'error', notificationElement)
 */
export function showNotification(message, type = 'success', notificationElement) {
    notificationElement.textContent = message
    notificationElement.className = `notification ${type}`
    notificationElement.style.display = 'block'
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notificationElement.style.display = 'none'
    }, 3000)
}

/**
 * Create a modal manager for handling modal operations
 * 
 * Returns object with 3 methods:
 * - open(modal) - Show modal
 * - setupCloseButton(closeBtn, modal) - Add close button listener
 * - setupBackdropClick(modal) - Allow closing by clicking backdrop
 * 
 * Usage in admin.js:
 *   const modalManager = createModalManager()
 *   modalManager.open(modal)  // Show modal
 *   modalManager.setupCloseButton(closeBtn, modal)  // Close on button click
 *   modalManager.setupBackdropClick(modal)  // Close on backdrop click
 * 
 * Reusable in orders.js, reservations.js:
 *   const orderModalManager = createModalManager()
 *   // Same usage pattern, different modals
 */
export function createModalManager() {
    return {
        /**
         * Open (show) a modal
         * @param {HTMLElement} modal - Modal element to display
         */
        open(modal) {
            modal.style.display = 'block'
        },
        
        /**
         * Setup close button functionality
         * @param {HTMLElement} closeBtn - Close button element
         * @param {HTMLElement} modal - Modal element to close
         */
        setupCloseButton(closeBtn, modal) {
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none'
                })
            }
        },
        
        /**
         * Allow closing modal by clicking the backdrop (outside modal content)
         * @param {HTMLElement} modal - Modal element
         */
        setupBackdropClick(modal) {
            modal.addEventListener('click', (e) => {
                // Only close if clicking directly on modal, not its children
                if (e.target === modal) {
                    modal.style.display = 'none'
                }
            })
        }
    }
}
