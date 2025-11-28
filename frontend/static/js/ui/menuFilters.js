const state = { category: 'all', diet: null };

function normalizeKey(s) {
    // Normalize a diet/category string for robust comparisons
    // e.g. "Gluten-Free", "gluten free" -> "glutenfree"
    return String(s || '').toLowerCase().trim().replace(/[\W_]+/g, '');
}

function applyFilters() {
    const cards = document.querySelectorAll('.menu-card');
    const activeDietKey = state.diet ? normalizeKey(state.diet) : null;

    const menuList = document.getElementById('menuList');
    const existingResults = document.getElementById('dietResults');

    if (activeDietKey) {
        // Build a grouped flat view of all matching cards
        const frag = document.createDocumentFragment();
        const grid = document.createElement('div');
        grid.className = 'menu-grid diet-results-grid';

        let matchCount = 0;
        cards.forEach(c => {
            const diets = (c.dataset.diet || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(normalizeKey);
            if (diets.includes(activeDietKey)) {
                // Prefer cloning the wrapping card container so styles are preserved
                const wrapper = c.closest('.menu-row__card') || c;
                const clone = wrapper.cloneNode(true);
                grid.appendChild(clone);
                matchCount += 1;
            }
        });

        if (existingResults) existingResults.remove();

        const resultsRoot = document.createElement('div');
        resultsRoot.id = 'dietResults';
        resultsRoot.className = 'menu-category menu-category--filtered';
        const heading = document.createElement('h3');
        heading.className = 'menu-category__heading';
        const activeDietBtn = document.querySelector('.filter-btn.diet.active');
        // Use the button's visible text for the heading so Title Case labels are preserved
        const displayDiet = activeDietBtn ? activeDietBtn.textContent.trim() : state.diet || '';
        heading.textContent = `${displayDiet} (${matchCount})`;
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
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    try { el.focus(); } catch (e) { /* ignore focus errors */ }
                }
            }
        });
    });
}

function attachDietListeners() {
    document.querySelectorAll('.filter-btn.diet').forEach(btn => {
        btn.addEventListener('click', () => {
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
            // If a grouped diet-results block was created, scroll to its heading and focus it
            const resultsRoot = document.getElementById('dietResults');
            if (resultsRoot) {
                const heading = resultsRoot.querySelector('.menu-category__heading') || resultsRoot;
                try {
                    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    heading.focus();
                } catch (e) { /* ignore */ }
            }
        });
    });
}

export function initMenuFilters() {
    // Called after menu cards are in the DOM

   
    attachCategoryListeners();
    attachDietListeners();
    applyFilters();
}