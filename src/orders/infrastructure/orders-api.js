import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const ordersEndpointPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * Infrastructure service gateway for the Orders bounded-context endpoints.
 *
 * @class OrdersApi
 * @extends BaseApi
 */
export class OrdersApi extends BaseApi {
    #ordersEndpoint;

    /** Creates the endpoint client for orders. */
    constructor() {
        super();
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
    }

    /**
     * Fetches all order resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the orders response.
     */
    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    /**
     * Fetches one order resource by identifier.
     * @param {number|string} id - Order identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the order response.
     */
    getOrderById(id) {
        return this.#ordersEndpoint.getById(id);
    }

    /**
     * Creates an order resource.
     * @param {Object} resource - Order resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created order response.
     */
    createOrder(resource) {
        return this.#ordersEndpoint.create(resource);
    }

    /**
     * Updates an order resource.
     * @param {Object} resource - Order resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated order response.
     */
    updateOrder(resource) {
        return this.#ordersEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes an order resource by identifier.
     * @param {number|string} id - Order identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteOrder(id) {
        return this.#ordersEndpoint.delete(id);
    }
}
