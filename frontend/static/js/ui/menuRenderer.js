// Simple unified menu renderer
// - Provides a tiny `renderMenuPage(items, options)` which returns
//   `{ highlightsNode, menuFragment }`.
// - Reuses the existing `createMenuCard` so behavior (Details/Add) is preserved.

import { createMenuCard } from "../components/menuCard.js";

function groupByCategory(items) {
  const groups = {};
  (items || []).forEach(item => {
    const cat = item && item.category ? item.category : 'Uncategorized';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

function pickHighlights(items = [], count = 3) {
  if (!Array.isArray(items)) return [];
  const featured = items.filter(i => i && i.featured);
  if (featured.length) return featured.slice(0, count);
  return items.slice(0, count);
}

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


