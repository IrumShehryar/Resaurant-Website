// Simple menu renderer
// - No validation, no normalization
// - Groups items by the raw `category` property and renders them
import { resolveImageUrl } from '../utils/image-resolver.js';
import { createMenuCard } from '../components/menuCard.js';

export function groupByCategory(items) {
    const groups = {};
    (items || []).forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
    });
    return groups;
}

export function renderSimpleMenu(items, container) {
    const groups = groupByCategory(items);
    const frag = document.createDocumentFragment();

    Object.keys(groups).forEach(cat => {
        // Preserve original class names so site CSS applies
        const section = document.createElement('section');
        section.className = 'menu-category';

        const heading = document.createElement('h3');
        heading.className = 'menu-category__heading';
        heading.textContent = cat;
        section.appendChild(heading);

        const row = document.createElement('div');
        row.className = 'menu-row';

        groups[cat].forEach(item => {
            // Reuse the existing card component so events and buttons behave the same
            const cardNode = createMenuCard(item);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'menu-row__card';
            cardWrapper.appendChild(cardNode);
            row.appendChild(cardWrapper);
        });

        section.appendChild(row);
        frag.appendChild(section);
    });

    container.appendChild(frag);
}
