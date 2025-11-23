// Minimal highlights loader for the homepage. Uses dynamic imports so a failed
// top-level import doesn't prevent the page from loading — errors are caught
// and surfaced inside the highlight root for easier debugging.
async function loadHighlights() {
  const root = document.getElementById('highlight-root');
  if (!root) return;

  root.textContent = 'Loading highlights...';

  try {
    // Use dynamic imports so we can handle module resolution failures gracefully
    const svc = await import('./services/menuService.js');
    const renderer = await import('./ui/menuRenderer.js');

    const getAllMenu = svc.getAllMenu;
    const renderMenuPage = renderer.renderMenuPage;

    const items = await getAllMenu();
    const { highlightsNode } = renderMenuPage(items, {
      highlightOptions: { preferCategoryOrder: ['Main','Dessert','Starter'] },
      menuOptions: { order: ['Starter','Main','Dessert','Side','Drink'], uppercase: false }
    });

    root.innerHTML = '';
    if (highlightsNode) {
      root.appendChild(highlightsNode);
      // Signal successful load for the inline fallback checker
      try { window.__highlights_loaded = true; } catch (e) {}
    }
    else root.textContent = 'No highlights available';
  } catch (err) {
    // Surface the error to the page so it's easy to spot without opening DevTools
    console.error('Highlights loader error:', err);
    root.innerHTML = `<div class="highlight-error">Failed to load highlights: ${String(err)}</div>`;
    try { window.__highlights_loaded = false; } catch (e) {}
  }
}

// If the DOM is already parsed call immediately, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHighlights);
} else {
  loadHighlights();
}
