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
export const showNotification = (message, type = 'success', notificationElement) => {
    notificationElement.textContent = message;
    notificationElement.className = `notification ${type}`;
    notificationElement.style.display = 'block';
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 3000);
};

/**
 * Check for new pending items and show notification if found
 * 
 * @param {Array} items - Array of items to check
 * @param {string} itemType - Type of item ('order' or 'reservation')
 * @param {HTMLElement} notificationElement - Target element for notification
 * @param {number} minutes - Time window in minutes to check (default: 5)
 * 
 * Usage:
 *   checkNewPendingItems(orders, 'order', notificationElement)
 *   checkNewPendingItems(reservations, 'reservation', notificationElement, 10)
 */
export const checkNewPendingItems = (items, itemType, notificationElement, minutes = 5) => {
    const newItems = items.filter(item => 
        item.status === 'pending' && 
        new Date(item.created_at) > new Date(Date.now() - minutes * 60 * 1000)
    );
    
    if (newItems.length > 0) {
        showNotification(`${newItems.length} new ${itemType}(s) pending approval!`, "info", notificationElement);
    }
};

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
export const createModalManager = () => {
    return {
        open: (modal) => {
            modal.style.display = 'block';
        },
        setupCloseButton: (closeBtn, modal) => {
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
        },
        setupBackdropClick: (modal) => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    };
};
