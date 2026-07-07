import { BaseApi } from '../../shared/infrastructure/base-api.js';

const ordersPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the Sales (Orders) bounded-context endpoints.
 * Orders are the aggregate root; quote and payments are nested sub-resources,
 * and lifecycle transitions are PATCH actions — so this gateway talks to the
 * raw HTTP client instead of the generic CRUD BaseEndpoint.
 *
 * @class OrdersApi
 * @extends BaseApi
 */
export class OrdersApi extends BaseApi {
    /**
     * Fetches orders, optionally filtered by customer or carpenter (role-scoped view).
     * @param {{ customerId?: number, carpenterId?: number }} [filter] - Optional single filter.
     * @returns {Promise<import('axios').AxiosResponse>} Orders response.
     */
    getOrders(filter = {}) {
        const params = {};
        if (filter.customerId)  params.customerId  = filter.customerId;
        if (filter.carpenterId) params.carpenterId = filter.carpenterId;
        return this.http.get(ordersPath, { params });
    }

    /**
     * Fetches one order by identifier.
     * @param {number|string} id - Order identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Order response.
     */
    getOrderById(id) {
        return this.http.get(`${ordersPath}/${id}`);
    }

    /**
     * Fetches the unassigned order pool (Pending orders any carpenter can claim).
     * @returns {Promise<import('axios').AxiosResponse>} Pool response.
     */
    getPool() {
        return this.http.get(`${ordersPath}/pool`);
    }

    /**
     * Creates an order. `resource` is the role-shaped payload already armed by the
     * store: a client sends only furniture fields; a carpenter also sends `customerId`.
     * @param {Object} resource - Create-order payload.
     * @returns {Promise<import('axios').AxiosResponse>} Created order response.
     */
    createOrder(resource) {
        return this.http.post(ordersPath, resource);
    }

    /**
     * Modifies the furniture details of a pending order (PATCH).
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - UpdateOrderResource payload (furniture details).
     * @returns {Promise<import('axios').AxiosResponse>} Updated order response.
     */
    modifyOrder(id, resource) {
        return this.http.patch(`${ordersPath}/${id}`, resource);
    }

    /** Accepts a pending order (carpenter). @param {number|string} id @returns {Promise} */
    acceptOrder(id) { return this.http.patch(`${ordersPath}/${id}/accept`); }

    /** Rejects a pending order (carpenter). @param {number|string} id @returns {Promise} */
    rejectOrder(id) { return this.http.patch(`${ordersPath}/${id}/reject`); }

    /** Cancels an order (customer). @param {number|string} id @returns {Promise} */
    cancelOrder(id) { return this.http.patch(`${ordersPath}/${id}/cancel`); }

    /** Starts production of an accepted order (carpenter): Accepted → InProgress. @param {number|string} id @returns {Promise} */
    startProduction(id) { return this.http.patch(`${ordersPath}/${id}/start`); }

    /** Marks an in-progress order ready (carpenter): InProgress → ReadyForDelivery. @param {number|string} id @returns {Promise} */
    markReady(id) { return this.http.patch(`${ordersPath}/${id}/ready`); }

    /** Completes/delivers a ready order (carpenter): ReadyForDelivery → Completed. @param {number|string} id @returns {Promise} */
    completeOrder(id) { return this.http.patch(`${ordersPath}/${id}/complete`); }

    /**
     * Generates the quote for a pending order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - GenerateQuoteResource ({ materialsCost, laborCost, estimatedProductionDays }).
     * @returns {Promise<import('axios').AxiosResponse>} Order response with the quote.
     */
    generateQuote(id, resource) {
        return this.http.post(`${ordersPath}/${id}/quote`, resource);
    }

    /** Accepts the quote proposed for an order (customer). @param {number|string} id @returns {Promise} */
    acceptQuote(id) { return this.http.patch(`${ordersPath}/${id}/quote/accept`); }

    /**
     * Registers a payment for an order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - RegisterPaymentResource ({ type, amount, receiptReference }).
     * @returns {Promise<import('axios').AxiosResponse>} Order response with the payment.
     */
    registerPayment(id, resource) {
        return this.http.post(`${ordersPath}/${id}/payments`, resource);
    }

    /**
     * Validates a payment receipt (carpenter).
     * @param {number|string} id - Order identifier.
     * @param {number|string} paymentId - Payment identifier.
     * @param {Object} resource - ValidatePaymentResource ({ isApproved }).
     * @returns {Promise<import('axios').AxiosResponse>} Updated order response.
     */
    validatePayment(id, paymentId, resource) {
        return this.http.patch(`${ordersPath}/${id}/payments/${paymentId}/validate`, resource);
    }
}
