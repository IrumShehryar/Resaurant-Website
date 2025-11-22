const state = { category: 'all', diet: null };

function applyFilters() {
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach(c => {
        const cat = (c.dataset.category || '').toLowerCase().trim();
        const diets = (c.dataset.diet || '').split(',').map(s => s.trim()).filter(Boolean);
        let visible = true;
        // Category buttons only control scroll-to-section; do NOT hide cards by category.
        // Keep all categories visible so the menu sections remain in the DOM.
        if (state.diet && !diets.includes(state.diet)) visible = false;
        c.style.display = visible ? '' : 'none';
    });

    // no aria-live updates (optional live region intentionally omitted)
}

function attachCategoryListeners() {
    document.querySelectorAll('.filter-btn.category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn.category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // update state.category for potential future use but do NOT use it to hide cards
            state.category = (btn.dataset.category || 'all').toLowerCase();
            // Only apply diet filters (if any) — keep sections visible.
            applyFilters();
            // Scroll to the section when a specific category is chosen
            const sectionId = state.category === 'all' ? null : `${state.category}s-section`;
            if (sectionId) {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function attachDietListeners() {
    document.querySelectorAll('.filter-btn.diet').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn.diet').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.diet = (btn.dataset.diet || '').toLowerCase().trim() || null;
            applyFilters();
        });
    });
}

export function initMenuFilters() {
    // Called after menu cards are in the DOM
    attachCategoryListeners();
    attachDietListeners();
    applyFilters();
}