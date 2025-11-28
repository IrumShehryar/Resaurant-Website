// Simple unified menu renderer
//
// Purpose:
// - Provide a single, minimal renderer that builds the "Today's Highlights"
//   block and a categorized menu fragment.

import { createMenuCard } from "../components/menuCard.js";

/**
 * Group a flat list of menu items by their raw `category` property.
 
 * @param {Array<Object>} items
 * @returns {Object<string, Array<Object>>} mapping category -> items[]
 */
function groupByCategory(items) {
  const groups = {};
  (items || []).forEach(item => {
    const cat = item && item.category ? item.category : 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

/**
 * Pick a small set of highlight items.
 *
 * Behavior:
 * - Prefer items marked `featured`; if none exist, fall back to the first
 *   N items from the list. 
 
 * @param {Array<Object>} items
 * @param {number} count
 * @returns {Array<Object>} up to `count` highlighted items
 */
function pickHighlights(items = []) {
  if (!Array.isArray(items)) return [];

  // Today’s day name must match what you store in days_of_week ("Monday", "Tuesday", etc.)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const wantedCategories = ['starter', 'main', 'dessert'];
  const result = [];

  wantedCategories.forEach(cat => {
    const item = items.find(i =>
      i &&
      String(i.category).toLowerCase() === cat &&
      Array.isArray(i.days_of_week) &&
      i.days_of_week.includes(today)
    );
    if (item) result.push(item);
  });

  return result; // up to 3 items: starter, main, dessert
}



/**
 * Build and return the DOM nodes for highlights and the categorized menu.
 *
 * API:
 * - `renderMenuPage(items, options)` returns an object with:
 *     - `highlightsNode` -> HTMLElement (grid of highlight cards)
 *     - `menuFragment` -> DocumentFragment (grouped category sections)
 *
 * Options (simple):
 * - `options.highlightsCount` - how many highlight slots to build (default 3)
 *
 * @param {Array<Object>} items - array of menu item objects
 * @param {Object} options
 * @returns {{highlightsNode: HTMLElement, menuFragment: DocumentFragment}}
 */
export function renderMenuPage(items = [], options = {}) {
  const highlightsArr = pickHighlights(items, options.highlightsCount || 3);

  const highlightsNode = document.createElement('div');
  highlightsNode.className = 'highlight-grid';
  highlightsArr.forEach(it => {
    const slot = document.createElement('div');
    slot.className = 'highlight-item';
    const card = createMenuCard(it);
    card.classList.add('highlight-card-inner');
    slot.appendChild(card);
    highlightsNode.appendChild(slot);
  });

  const menuFragment = document.createDocumentFragment();
  const groups = groupByCategory(items);
  Object.keys(groups).forEach(cat => {
    const section = document.createElement('section');
    section.className = 'menu-category';
    // give a stable id for category sections so filters can scroll to them
    const normalized = String(cat || 'category').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    section.id = `${normalized}s-section`;

    const heading = document.createElement('h3');
    heading.className = 'menu-category__heading';
    heading.textContent = cat;
    section.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'menu-row';

    groups[cat].forEach(it => {
      const wrapper = document.createElement('div');
      wrapper.className = 'menu-row__card';
      const card = createMenuCard(it);
      wrapper.appendChild(card);
      row.appendChild(wrapper);
    });

    section.appendChild(row);
    menuFragment.appendChild(section);
  });

  return { highlightsNode, menuFragment };
}


