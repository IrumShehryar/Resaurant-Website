// Minimal highlights loader for the homepage.
import { getAllMenu } from './services/menuService.js';
import { renderMenuPage } from './ui/menuRenderer.js';

async function loadHighlights() {
  const root = document.getElementById('highlight-root');
  if (!root) return;

  root.textContent = 'Loading highlights...';

  try {
    const items = await getAllMenu();
    const { highlightsNode } = renderMenuPage(items, {
      highlightOptions: { preferCategoryOrder: ['Main','Dessert','Starter'] },
      menuOptions: { order: ['Starter','Main','Dessert','Side','Drink'], uppercase: false }
    });

    root.innerHTML = '';
    if (highlightsNode) root.appendChild(highlightsNode);
    else root.textContent = 'No highlights available';
  } catch (err) {
    console.error('Failed to load highlights:', err);
    root.textContent = 'Failed to load highlights';
  }
}

document.addEventListener('DOMContentLoaded', loadHighlights);
