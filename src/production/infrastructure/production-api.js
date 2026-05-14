import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const stagesEndpointPath = import.meta.env.VITE_STAGES_ENDPOINT_PATH;

/**
 * Infrastructure service gateway for the Production bounded-context endpoints.
 *
 * @class ProductionApi
 * @extends BaseApi
 */
export class ProductionApi extends BaseApi {
    #stagesEndpoint;

    /** Creates the endpoint client for production stages. */
    constructor() {
        super();
        this.#stagesEndpoint = new BaseEndpoint(this, stagesEndpointPath);
    }

    /**
     * Fetches all stage resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the stages response.
     */
    getStages() {
        return this.#stagesEndpoint.getAll();
    }

    /**
     * Fetches a stage resource by identifier.
     * @param {number|string} id - Stage identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the stage response.
     */
    getStageById(id) {
        return this.#stagesEndpoint.getById(id);
    }

    /**
     * Creates a stage resource.
     * @param {Object} resource - Stage resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created stage response.
     */
    createStage(resource) {
        return this.#stagesEndpoint.create(resource);
    }

    /**
     * Updates a stage resource.
     * @param {Object} resource - Stage resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated stage response.
     */
    updateStage(resource) {
        return this.#stagesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a stage resource by identifier.
     * @param {number|string} id - Stage identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteStage(id) {
        return this.#stagesEndpoint.delete(id);
    }
}
