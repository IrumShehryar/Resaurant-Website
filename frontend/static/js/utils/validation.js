
export function validateMenuItemFields({ name, price, category, dietary, allergens, ingredients, days_of_week, active }) {
    const allowedCategories = ["starter", "main", "dessert", "side", "drink", "special"];
    const allowedDietary = [
        "vegetarian", "vegan", "non-vegetarian", "gluten-free", "dairy-free",
        "pescatarian", "sugar-free", "nut-free", "keto-friendly", "alcoholic", "non-alcoholic"
    ];
    const allowedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    if (!name || name.trim().length < 3) {
        return { valid: false, message: "Name must be at least 3 characters" };
    }
    if (!/[A-Za-z]/.test(name)) {
        return { valid: false, message: "Name must contain at least one letter" };
    }
    if (!allowedCategories.includes(category)) {
        return { valid: false, message: "Please select a valid category" };
    }
    if (isNaN(price) || price <= 0) {
        return { valid: false, message: "Price must be greater than 0" };
    }
    if (category === "starter" && (price < 4 || price > 12)) {
        return { valid: false, message: "Starters must be priced between 4 and 12" };
    }
    if (category === "main" && (price < 10 || price > 25)) {
        return { valid: false, message: "Main courses must be priced between 10 and 25" };
    }
    if (category === "dessert" && (price < 5 || price > 10)) {
        return { valid: false, message: "Desserts must be priced between 5 and 10" };
    }
    if (category === "side" && (price < 3 || price > 8)) {
        return { valid: false, message: "Sides must be priced between 3 and 8" };
    }
    if (category === "drink" && (price < 2 || price > 15)) {
        return { valid: false, message: "Drinks must be priced between 2 and 15" };
    }
    if (category === "special" && (price < 15 || price > 35)) {
        return { valid: false, message: "Specials must be priced between 15 and 35" };
    }
    if (!Array.isArray(dietary) || dietary.length === 0) {
        return { valid: false, message: "Select at least one dietary option" };
    }
    for (const d of dietary) {
        if (!allowedDietary.includes(d)) {
            return { valid: false, message: `Invalid dietary value: ${d}` };
        }
    }
    if (active) {
        if (!Array.isArray(days_of_week) || days_of_week.length === 0) {
            return { valid: false, message: "Active items must be assigned to at least one day of the week" };
        }
        for (const day of days_of_week) {
            if (!allowedDays.includes(day)) {
                return { valid: false, message: `Invalid day of week: ${day}` };
            }
        }
    }
    if (dietary.includes("vegan") && Array.isArray(allergens)) {
        const dairyAllergens = ["dairy", "milk", "cheese", "cream", "butter"];
        const itemAllergens = allergens.map(a => a.toLowerCase());
        if (dairyAllergens.some(dairy => itemAllergens.includes(dairy))) {
            return { valid: false, message: "Vegan items cannot contain dairy allergens" };
        }
    }
    if (dietary.includes("gluten-free") && Array.isArray(allergens)) {
        const glutenAllergens = ["gluten", "wheat", "barley", "rye"];
        const itemAllergens = allergens.map(a => a.toLowerCase());
        if (glutenAllergens.some(gluten => itemAllergens.includes(gluten))) {
            return { valid: false, message: "Gluten-free items cannot contain gluten allergens" };
        }
    }
    return { valid: true };
}