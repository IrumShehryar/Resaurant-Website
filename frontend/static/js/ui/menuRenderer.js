/**
 * menuRenderer.js
 *
 * - Uses a plain object (no Map) for grouping and a tiny schema validator.
 * - Exports renderHighlights(items, options), renderMenuFragment(items, options)
 *   and renderMenuPage(items, options) which returns both nodes.
 */

// Utilities and components used to build DOM for menu cards and highlights
import { createMenuCard } from "../components/menuCard.js";
import { resolveImageUrl } from "../utils/image-resolver.js";

// Basic sanity check for a menu item before rendering.
export function validateItem(item) {
	if (!item || typeof item !== 'object') return false;
	if (!item.id && !item._id) return false;
	if (!item.name || typeof item.name !== 'string') return false;
	if (item.category && typeof item.category !== 'string') return false;
	if (item.price !== undefined && item.price !== null && isNaN(Number(item.price))) return false;   
	return true;
}

// Map common category synonyms to canonical display labels.
const CATEGORY_ALIASES = {
	'starter': 'Starter',
	'starters': 'Starter',
	'appetizer': 'Starter',
	'appetizers': 'Starter',

	'main': 'Main',
	'mains': 'Main',
	'main course': 'Main',
	'entree': 'Main',

	'dessert': 'Dessert',
	'desert': 'Dessert',

	'side': 'Side',
	'sides': 'Side',

	'drink': 'Drink',
	'drinks': 'Drink',
	'beverage': 'Drink',
	'beverages': 'Drink'
};

// Normalize a raw category string into a display label (uses aliases).
function normalizeCategoryName(value) {
	const raw = (value && typeof value === 'string') ? value.trim() : 'Uncategorized';
	const key = raw.toLowerCase();
	return CATEGORY_ALIASES[key] || raw;
}

// Create a stable object key from a display label (lowercased).
function normalizedKey(displayLabel) {
	return String(displayLabel || '').trim().toLowerCase();
}

// Group a flat array of items into an object keyed by normalized category.
// Each entry has { displayLabel, items: [...] } ready for rendering.
function groupItemsByCategory(items) {
	const groupsByKey = {};
	items.forEach(it => {
		if (!validateItem(it)) return;
		const displayLabel = normalizeCategoryName(it.category);
		const key = normalizedKey(displayLabel);
		if (!groupsByKey[key]) groupsByKey[key] = { displayLabel, items: [] };
		groupsByKey[key].items.push(it);
	});
	return groupsByKey;
}

// Pick one item for a category. Preference: featured -> today -> first available.
// `usedIds` is a Set used to avoid duplicate picks for multiple highlight slots.
function pickFirstByCategory(items, categoryLabel, usedIds) {
	const key = normalizedKey(normalizeCategoryName(categoryLabel));
	const todayName = new Date().toLocaleString(undefined, { weekday: 'long' }).toLowerCase();        

	let found = items.find(i => {
		if (!i) return false;
		const d = normalizeCategoryName(i.category);
		if (normalizedKey(d) !== key) return false;
		const idStr = String(i.id || i._id);
		if (usedIds.has(idStr)) return false;
		return Boolean(i.featured);
	});
	if (found) return found;

	found = items.find(i => {
		if (!i) return false;
		const d = normalizeCategoryName(i.category);
		if (normalizedKey(d) !== key) return false;
		const idStr = String(i.id || i._id);
		if (usedIds.has(idStr)) return false;
		return Array.isArray(i.days_of_week) && i.days_of_week.map(x => String(x).toLowerCase()).includes(todayName);
	});
	if (found) return found;

	found = items.find(i => {
		if (!i) return false;
		const d = normalizeCategoryName(i.category);
		if (normalizedKey(d) !== key) return false;
		const idStr = String(i.id || i._id);
		if (usedIds.has(idStr)) return false;
		return true;
	});
	return found || null;
}

export function renderHighlights(items = [], options = {}) {
	const { createCard = createMenuCard, preferCategoryOrder = ['Main', 'Dessert', 'Starter'] } = options;                                                                                                
	const usedIds = new Set();
	const picks = [];
	for (const cat of preferCategoryOrder) {
		const picked = pickFirstByCategory(items, cat, usedIds);
		if (picked) {
			picks.push(picked);
			usedIds.add(String(picked.id || picked._id));
		} else {
			picks.push(null);
		}
	}

	const highlightGrid = document.createElement('div');
	highlightGrid.className = 'highlight-grid';

	const makeSlot = (item) => {
		const slot = document.createElement('div');
		slot.className = 'highlight-item';
		if (item) {
			const card = createCard(item);
			card.classList.add('highlight-card-inner');
			slot.appendChild(card);

			const resolved = card.dataset.img || resolveImageUrl(item);
			if (resolved) {
				slot.style.backgroundImage = `url('${resolved}')`;
				slot.style.backgroundRepeat = 'no-repeat';
				slot.style.backgroundSize = 'cover';
				slot.style.backgroundPosition = 'center';
				const imgEl = card.querySelector('img');
				if (imgEl) imgEl.style.display = 'none';
			}
		} else {
			slot.innerHTML = `
				<div class="placeholder-thumb"></div>
				<div class="highlight-body"><span class="highlight-title">Coming Soon</span></div>
			`;
		}
		return slot;
	};

	const mainSlot = makeSlot(picks[0]);
	mainSlot.classList.add('highlight-main');
	highlightGrid.appendChild(mainSlot);

	for (let i = 1; i <= 2; i++) {
		const slot = makeSlot(picks[i]);
		highlightGrid.appendChild(slot);
	}

	return highlightGrid;
}

export function renderMenuFragment(items = [], options = {}) {
	const { order = ['Starter', 'Main', 'Dessert', 'Side', 'Drink'], uppercase = false, createCard = createMenuCard } = options;                                                                                                  
	const groupsByKey = groupItemsByCategory(items);

	const existingKeys = Object.keys(groupsByKey);
	const normalizedPrefOrder = (Array.isArray(order) ? order : []).map(o => normalizedKey(normalizeCategoryName(o)));                                                                                      const orderedCategoryKeys = [];

	normalizedPrefOrder.forEach(k => {
		if (groupsByKey[k] && !orderedCategoryKeys.includes(k)) orderedCategoryKeys.push(k);
	});
	existingKeys.sort();
	existingKeys.forEach(k => { if (!orderedCategoryKeys.includes(k)) orderedCategoryKeys.push(k); });
																																																			const fragment = document.createDocumentFragment();
	orderedCategoryKeys.forEach(categoryKey => {
		const group = groupsByKey[categoryKey];
		if (!group) return;

		const section = document.createElement('section');
		section.className = 'menu-category';
		section.dataset.category = categoryKey;

		const heading = document.createElement('h3');
		heading.className = 'menu-category__heading';
		heading.textContent = uppercase ? group.displayLabel.toUpperCase() : group.displayLabel;        
		section.appendChild(heading);

		// Render this category as a horizontal row of cards
		const grid = document.createElement('div');
		// use `menu-row` for horizontal flex layout; keep `menu-grid` class for any shared container rules
		grid.className = 'menu-row';

		group.items.forEach(it => {
			const card = createCard(it);
			// make each card a non-flexible, fixed-width item so rows stay horizontal
			card.classList.add('menu-row__card');
			grid.appendChild(card);
		});

		section.appendChild(grid);
		fragment.appendChild(section);
	});

	return fragment;
}

export function renderMenuPage(items = [], options = {}) {
	const highlightsNode = renderHighlights(items, options.highlightOptions || {});
	const menuFragment = renderMenuFragment(items, options.menuOptions || {});
	return { highlightsNode, menuFragment };
}


