const state = { category: 'all', diet: null };

function normalizeKey(s) {
    // Normalize a diet/category string for robust comparisons
    // e.g. "Gluten-Free", "gluten free" -> "glutenfree"
    return String(s || '').toLowerCase().trim().replace(/[\W_]+/g, '');
}

function applyFilters() {
    const cards = document.querySelectorAll('.menu-card');
    const activeDietKey = state.diet ? normalizeKey(state.diet) : null;
    // Debug: show which diet is active (helps track mismatches)
    if (activeDietKey) console.log('[menuFilters] activeDietKey=', activeDietKey);

    const menuList = document.getElementById('menuList');
    const existingResults = document.getElementById('dietResults');

    if (activeDietKey) {
        // Build a grouped flat view of all matching cards
        const frag = document.createDocumentFragment();
        const grid = document.createElement('div');
        grid.className = 'menu-grid diet-results-grid';

        cards.forEach(c => {
            const diets = (c.dataset.diet || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(normalizeKey);

            // Debug: print card's diet keys to help diagnose missing items
            const title = c.querySelector('.menu-card__title')?.textContent || c.dataset.id || '<unknown>';
            console.log('[menuFilters] card:', title, '-> diets=', diets, 'dataset.diet=', c.dataset.diet);

            if (diets.includes(activeDietKey)) {
                // Prefer cloning the wrapping card container so styles are preserved
                const wrapper = c.closest('.menu-row__card') || c;
                const clone = wrapper.cloneNode(true);
                grid.appendChild(clone);
            }
        });

        if (existingResults) existingResults.remove();

        const resultsRoot = document.createElement('div');
        resultsRoot.id = 'dietResults';
        resultsRoot.className = 'menu-category menu-category--filtered';
        const heading = document.createElement('h3');
        heading.className = 'menu-category__heading';
        heading.textContent = `${state.diet}`.toWellFormed();
        resultsRoot.appendChild(heading);
        resultsRoot.appendChild(grid);

        // Hide the original categorized sections
        document.querySelectorAll('.menu-category').forEach(s => s.style.display = 'none');

        // Insert results at the top of menuList
        if (menuList) menuList.prepend(resultsRoot);

        return;
    }

    // No active diet — remove any temporary results view and show original sections
    if (existingResults) existingResults.remove();
    document.querySelectorAll('.menu-category').forEach(s => s.style.display = '');

    // Ensure individual cards are visible (no diet filter)
    cards.forEach(c => c.style.display = '');

    // no aria-live updates (optional live region intentionally omitted)
}

function attachCategoryListeners() {
    document.querySelectorAll('.filter-btn.category').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('[menuFilters] category clicked ->', btn.dataset.category);
            document.querySelectorAll('.filter-btn.category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // update state.category for potential future use but do NOT use it to hide cards
            state.category = (btn.dataset.category || 'all').toLowerCase();
            // Mutual exclusivity: clear any active diet when a category is chosen
            document.querySelectorAll('.filter-btn.diet').forEach(b => b.classList.remove('active'));
            state.diet = null;
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
            console.log('[menuFilters] diet clicked ->', btn.dataset.diet);
            // Toggle behaviour: clicking the already-active diet clears the filter
            const clickedDiet = (btn.dataset.diet || '').toLowerCase().trim() || null;
            const wasActive = btn.classList.contains('active');
            document.querySelectorAll('.filter-btn.diet').forEach(b => b.classList.remove('active'));
            if (wasActive) {
                // clear filter
                state.diet = null;
            } else {
                // Mutual exclusivity: clear any active category when a diet is chosen
                document.querySelectorAll('.filter-btn.category').forEach(b => b.classList.remove('active'));
                state.category = 'all';
                btn.classList.add('active');
                state.diet = clickedDiet;
            }
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