import { BaseApi } from '../../shared/infrastructure/base-api.js';

const inventoryPath = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Inventory bounded-context endpoints (`/inventory`).
 * The backend exposes create, list, get-by-id and a PATCH that updates only the
 * stock levels; there is no delete — so it talks to the raw HTTP client.
 *
 * @class InventoryApi
 * @extends BaseApi
 */
export class InventoryApi extends BaseApi {
    /**
     * Fetches all materials.
     * @returns {Promise<import('axios').AxiosResponse>} Materials response.
     */
    getMaterials() {
        return this.http.get(inventoryPath);
    }

    /**
     * Fetches one material by identifier.
     * @param {number|string} id - Material identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Material response.
     */
    getMaterialById(id) {
        return this.http.get(`${inventoryPath}/${id}`);
    }

    /**
     * Creates a material.
     * @param {Object} resource - CreateInventoryMaterialResource ({ materialType, quantity, unit, minStock }).
     * @returns {Promise<import('axios').AxiosResponse>} Created material response.
     */
    createMaterial(resource) {
        return this.http.post(inventoryPath, resource);
    }

    /**
     * Updates the stock levels of a material (PATCH).
     * @param {number|string} id - Material identifier.
     * @param {Object} resource - UpdateInventoryMaterialResource ({ quantity, minStock }).
     * @returns {Promise<import('axios').AxiosResponse>} Updated material response.
     */
    updateMaterial(id, resource) {
        return this.http.patch(`${inventoryPath}/${id}`, resource);
    }
}
