// Page controller for the menu page.
// Responsibilities:
// - load the menu list from the service
// - render menu cards
// - respond to card events (open detail modal)

import { getAllMenu, getMenuById } from "./services/menuService.js";
import { renderItemDetail } from './ui/modalRenderer.js';
import { renderMenuPage } from './ui/menuRenderer.js';
import { createModal } from './components/modal.js';
import { initCartUI } from "./cart.js";
import { initMenuFilters } from "./ui/menuFilters.js";

/**
 * Load the menu list into the #menuList container.
 * 
 * Steps:
 *  1) Show a loading state
 *  2) Fetch items from menu service
 *  3) Render cards efficiently using DocumentFragment
 *  4) Handle empty results and errors gracefully
 *
 * @async
 * @function loadMenu
 * @returns {Promise<void>}
 * @throws {Error} If menu service fails to load items
 * 
 * @example
 * // Called on page load
 * await loadMenu();
 */
const loadMenu = async () => {
  const el = document.getElementById("menuList");
  if (!el) return;

  el.textContent = "Loading...";

  try {
    const items = await getAllMenu();
    const { highlightsNode, menuFragment } = renderMenuPage(items, {
      highlightOptions: { preferCategoryOrder: ["Main", "Dessert", "Starter"] },
      menuOptions: { order: ["Starter", "Main", "Dessert", "Side", "Drink"], uppercase: false }
    });

    el.innerHTML = "";
    const highlightRoot = document.getElementById("highlight-root");
    if (highlightRoot && highlightsNode) {
      highlightRoot.innerHTML = "";
      highlightRoot.appendChild(highlightsNode);
    }
    if (menuFragment) {
      el.appendChild(menuFragment);
      try {
        initMenuFilters();
      } catch (err) {
        console.warn(`Menu filters init failed: ${err}`);
      }
    } else {
      el.textContent = "No items in the menu";
    }
  } catch (err) {
    el.textContent = "Failed to load the menu";
    console.error(err);
  }
};


const modal = createModal();

/**
 * Fetch a single menu item by ID and display it in the modal.
 * 
 * This function:
 * - Fetches item details from the menu service
 * - Renders the item in detail format
 * - Opens the modal with the rendered content
 * - Closes when user clicks the close button
 *
 * @async
 * @function showDetail
 * @param {number} id - The menu item ID to load and display
 * @returns {Promise<void>}
 * @throws {Error} If item fetch fails (logged to console)
 * 
 * @example
 * // Show menu item #5
 * await showDetail(5);
 */
const showDetail = async (id) => {
  try {
    const item = await getMenuById(id);
    modal.setContent(renderItemDetail(item));
    modal.open();
    // The modal factory also wires the element with id="modal-close" if present
    // However some renderers may not include it; the factory already handles wiring.
  } catch (err) {
    console.error(`Show detail error: ${err}`);
  }
};

// Initialize when DOM is available. Attach event listeners after #menuList exists
/**
 * Initialize the menu page when the DOM is ready.
 * 
 * Sets up:
 * - Initial menu list loading
 * - Event listener for custom 'show-detail' events from menu cards
 * 
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  initCartUI();
  // Expose addToCart globally for dietary filter event handlers
  import('./cart.js').then(mod => {
    window.addToCart = mod.addToCart;
  });

  const menuListEl = document.getElementById("menuList");
  if (menuListEl) {
    menuListEl.addEventListener("show-detail", (e) => {
      const id = e.detail?.id;
      if (id != null) showDetail(id);
    });
  }

  document.addEventListener("show-detail", (e) => {
    const id = e.detail?.id;
    if (menuListEl && e.target && menuListEl.contains(e.target)) return;
    if (id != null) showDetail(id);
  });
});
