/**
 * Menu card component
 *
 * Creates a DOM element representing a menu item. The card is intentionally
 * small — it holds the visible data and manages only the local UI (button
 * wiring). It emits a CustomEvent named "show-detail" when the Details
 * button is clicked so the page controller can respond.
 *
 * @param {Object} item - Menu item object from the API.
 * @param {number} item.id
 * @param {string} item.name
 * @param {string} item.category
 * @param {number} item.price
 * @returns {HTMLElement} A DOM node representing the card.
 */
import {addToCart} from "../cart.js"
import { resolveImageUrl } from "../utils/image-resolver.js";   

export const createMenuCard = (item) => {
  // Create the root container for the card: <div class="menu-card">
  const el = document.createElement('div');
  el.className = 'menu-card';

  // Store the item id on the element as a data-* attribute so controllers can read it later.
  // Access in JS via el.dataset.id
  
  el.dataset.id = item.id;
  // Category and diet attributes for filtering (normalize to lowercase)
  el.dataset.category = String(item.category || '').trim().toLowerCase();
  const dietary = Array.isArray(item.dietary) ? item.dietary : (item.dietary ? [item.dietary] : []);
  el.dataset.diet = dietary.map(d => String(d).trim().toLowerCase()).filter(Boolean).join(',');
  // Optional beverage type fields (handle different API field names)
  if (item.beverageType) el.dataset.beverage = String(item.beverageType).trim().toLowerCase();
  if (item.beverage) el.dataset.beverage = String(item.beverage).trim().toLowerCase();
  // resolve image source similar to menuRenderer: prefer image_url, then image filename, then fallback
  const imgSrc = resolveImageUrl(item);
  el.dataset.img = imgSrc; // store resolved image URL for potential reuse

  // Insert the card's inner structure.
 
  el.innerHTML = `
    <img
      class="menu-card__image"
      src="${imgSrc}"
      alt="${item.name}"
    >
    <div class="menu-info">
      <!-- Title for the menu item -->
      <b class="menu-card__title">${item.name}</b>

      <!-- Meta line: category • price -->
      <div class="menu-card__meta">${item.price}€</div>
    </div>

    <div class="menu-actions">
     
      <button
        class="btn btn-secondary btn-detail"
        aria-label="Show details for ${item.name}">
          ${window.t.details}
      </button>

      <!-- "Add to cart" button. We also put the id here for quick access via dataset. -->
        <button class="btn btn-accent btn-add" data-id="${item.id|| item._id}">${window.t.add_to_cart}</button>
    </div>
  `;

  // Find the Details button inside this card.
  const btn = el.querySelector('.btn-detail');

  
  if (btn) {
    // Attach a click handler only to this card's Details button.
    btn.addEventListener('click', () => {
      // bubbles: true allows the event to travel up the DOM (event bubbling),
      // so a single parent listener can handle all cards (event delegation).
      el.dispatchEvent(new CustomEvent('show-detail', {
          bubbles: true,
          detail: { id: item.id || item._id },
        }));   
    });
  }

  
  const btnAdd = el.querySelector('.btn-add');
  // Guard in case markup changes and the selector fails.
  if (btnAdd) {
    btnAdd.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(item)
      
    })
  }

  // Return the fully constructed card so the caller can append it to the list.
  return el;
}

