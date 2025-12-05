// Order form validation
export function validateOrderFormFields({ name, email, phone, order_date, order_time, total, status, items }) {
    if (!name || name.trim().length < 3) {
        return { valid: false, message: "Name must be at least 3 characters" };
    }
    if (!/[A-Za-zÅÄÖåäö]/.test(name)) {
        return { valid: false, message: "Name must contain at least one letter" };
    }
    if (!email || email.trim().length === 0) {
        return { valid: false, message: "Email cannot be empty" };
    }
    if (!email.includes("@")) {
        return { valid: false, message: "Invalid email address" };
    }
    if (!phone || phone.trim().length === 0) {
        return { valid: false, message: "Phone number cannot be empty" };
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
        return { valid: false, message: "Phone number must be at least 7 digits and contain only numbers, spaces, or + - ( )" };
    }
    // Address validation
    if (!arguments[0].address || arguments[0].address.trim().length === 0) {
        return { valid: false, message: "Address cannot be empty" };
    }
    if (!order_date || order_date.trim().length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(order_date)) {
        return { valid: false, message: "Invalid order date format (use YYYY-MM-DD)" };
    }
    if (!order_time || order_time.trim().length === 0 || !/^\d{2}:\d{2}$/.test(order_time)) {
        return { valid: false, message: "Invalid order time format (use HH:MM)" };
    }
    if (!total || isNaN(total) || Number(total) <= 0) {
        return { valid: false, message: "Order amount is required" };
    }
    if (!status || status.trim().length === 0) {
        return { valid: false, message: "Status must be added" };
    }
    // Items format validation
    if (!Array.isArray(items) || items.length === 0) {
        return { valid: false, message: "Order must contain at least one item in 'name:quantity' format" };
    }
    for (const item of items) {
        if (!item.item_name || typeof item.item_name !== "string" || item.item_name.trim().length < 1) {
            return { valid: false, message: "Each item must have a name" };
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return { valid: false, message: `Invalid quantity for item '${item.item_name}'. Use format 'pizza:1'` };
        }
    }
    return { valid: true };
}

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