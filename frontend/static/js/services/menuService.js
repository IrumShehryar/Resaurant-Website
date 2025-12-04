import { apiUrl } from "../utils/config.js";
import fetchData from "../utils/fetchData.js";

/**
 * Service: menuService
 *
 * Thin network layer that exposes functions for the menu API. Returning
 * raw JSON payloads keeps this layer simple and lets callers determine
 * how to render or transform the data.
 */

/**
 * Fetch all menu items from the backend API.
 * Public: No token required.
 * @returns {Promise<Array<Object>>} Promise that resolves to an array of menu item objects.
 */
export const getAllMenu = () => fetchData(apiUrl("menu"));

/**
 * Fetch a single menu item by id.
 * Public: No token required.
 * @param {number|string} id - Item id to fetch. The service passes it to the API as-is.
 * @returns {Promise<Object>} Promise that resolves to the item object.
 */
export const getMenuById = (id) => fetchData(apiUrl(`menu/${id}`));
