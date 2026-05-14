import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const materialsEndpointPath = import.meta.env.VITE_MATERIALS_ENDPOINT_PATH;

/**
 * Infrastructure service gateway for the Inventory bounded-context endpoints.
 *
 * @class InventoryApi
 * @extends BaseApi
 */
export class InventoryApi extends BaseApi {
    #materialsEndpoint;

    /** Creates the endpoint client for materials. */
    constructor() {
        super();
        this.#materialsEndpoint = new BaseEndpoint(this, materialsEndpointPath);
    }

    /**
     * Fetches all material resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the materials response.
     */
    getMaterials() {
        return this.#materialsEndpoint.getAll();
    }

    /**
     * Fetches one material resource by identifier.
     * @param {number|string} id - Material identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the material response.
     */
    getMaterialById(id) {
        return this.#materialsEndpoint.getById(id);
    }

    /**
     * Creates a material resource.
     * @param {Object} resource - Material resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created material response.
     */
    createMaterial(resource) {
        return this.#materialsEndpoint.create(resource);
    }

    /**
     * Updates a material resource.
     * @param {Object} resource - Material resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated material response.
     */
    updateMaterial(resource) {
        return this.#materialsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a material resource by identifier.
     * @param {number|string} id - Material identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteMaterial(id) {
        return this.#materialsEndpoint.delete(id);
    }
}
