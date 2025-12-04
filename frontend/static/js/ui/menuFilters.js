const state = { category: 'all', diet: null };

const normalizeKey = (s) => {
    return String(s || '').toLowerCase().trim().replace(/[\W_]+/g, '');
};

const applyFilters = () => {
    const cards = document.querySelectorAll('.menu-card');
    const activeDietKey = state.diet ? normalizeKey(state.diet) : null;
    const menuList = document.getElementById('menuList');
    const existingResults = document.getElementById('dietResults');
    if (activeDietKey) {
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
                const wrapper = c.closest('.menu-row__card') || c;
                const clone = wrapper.cloneNode(true);
                // Always get item data from closest .menu-card or its parent
                let itemData = null;
                const nestedOriginal = wrapper.querySelector('.menu-card');
                if (wrapper.__itemData) {
                    itemData = wrapper.__itemData;
                } else if (c.__itemData) {
                    itemData = c.__itemData;
                } else if (nestedOriginal && nestedOriginal.__itemData) {
                    itemData = nestedOriginal.__itemData;
                }
                // Attach item data to clone and nested .menu-card
                clone.__itemData = itemData;
                const nestedClone = clone.querySelector('.menu-card');
                if (nestedClone) nestedClone.__itemData = itemData;
                // Re-attach Details button event listener
                const btn = clone.querySelector('.btn-detail');
                if (btn && itemData) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clone.dispatchEvent(new CustomEvent('show-detail', {
                            bubbles: true,
                            detail: { id: itemData.id || itemData._id, item: itemData }
                        }));
                    });
                }
                // Re-attach Add to Cart button event listener
                const btnAdd = clone.querySelector('.btn-add');
                if (btnAdd && itemData) {
                    btnAdd.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.addToCart) {
                            window.addToCart(itemData);
                        } else {
                            clone.dispatchEvent(new CustomEvent('add-to-cart', {
                                bubbles: true,
                                detail: { id: itemData.id || itemData._id, item: itemData }
                            }));
                        }
                    });
                }
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
        const displayDiet = activeDietBtn ? activeDietBtn.textContent.trim() : state.diet || '';
        heading.textContent = `${displayDiet} (${matchCount})`;
        resultsRoot.appendChild(heading);
        resultsRoot.appendChild(grid);
        document.querySelectorAll('.menu-category').forEach(s => s.style.display = 'none');
        if (menuList) menuList.prepend(resultsRoot);
        return;
    }
    if (existingResults) existingResults.remove();
    document.querySelectorAll('.menu-category').forEach(s => s.style.display = '');
    cards.forEach(c => c.style.display = '');
};

const attachCategoryListeners = () => {
    document.querySelectorAll('.filter-btn.category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn.category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.category = (btn.dataset.category || 'all').toLowerCase();
            document.querySelectorAll('.filter-btn.diet').forEach(b => b.classList.remove('active'));
            state.diet = null;
            applyFilters();
            const sectionId = state.category === 'all' ? null : `${state.category}s-section`;
            if (sectionId) {
                const el = document.getElementById(sectionId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    try { el.focus(); } catch (e) { }
                }
            }
        });
    });
};

const attachDietListeners = () => {
    document.querySelectorAll('.filter-btn.diet').forEach(btn => {
        btn.addEventListener('click', () => {
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