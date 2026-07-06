import { BaseApi } from '../../shared/infrastructure/base-api.js';

const ordersPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/** Builds the nested stages path for an order. */
const stagesPath = (orderId) => `${ordersPath}/${orderId}/stages`;

/**
 * Infrastructure gateway for the Production (Manufacturing) endpoints. Stages are
 * nested under an order (`/orders/{orderId}/stages`): defined as an ordered list,
 * listed, and advanced by status. No delete — so it uses the raw HTTP client.
 *
 * @class ProductionApi
 * @extends BaseApi
 */
export class ProductionApi extends BaseApi {
    /**
     * Fetches the production stages of an order.
     * @param {number|string} orderId - Order identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Stages response.
     */
    getStages(orderId) {
        return this.http.get(stagesPath(orderId));
    }

    /**
     * Defines the ordered production stages for an accepted order.
     * @param {number|string} orderId - Order identifier.
     * @param {{ carpenterId: number, stages: Array<{ name: string, estimatedTimeInDays: number }> }} resource - Plan.
     * @returns {Promise<import('axios').AxiosResponse>} Created stages response.
     */
    defineStages(orderId, resource) {
        return this.http.post(stagesPath(orderId), resource);
    }

    /**
     * Updates the status of a production stage.
     * @param {number|string} orderId - Order identifier.
     * @param {number|string} stageId - Stage identifier.
     * @param {{ status: string, requestingUserId: number }} resource - New status + acting carpenter id.
     * @returns {Promise<import('axios').AxiosResponse>} Updated stage response.
     */
    updateStageStatus(orderId, stageId, resource) {
        return this.http.patch(`${stagesPath(orderId)}/${stageId}`, resource);
    }
}
