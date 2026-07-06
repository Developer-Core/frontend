import { BaseApi } from '../../shared/infrastructure/base-api.js';

const ordersPath = import.meta.env.VITE_ORDERS_ENDPOINT_PATH;

/** Builds the nested messages path for an order. */
const messagesPath = (orderId) => `${ordersPath}/${orderId}/messages`;

/**
 * Infrastructure gateway for the Communication (Engagement) endpoints. Messages
 * are nested under an order (`/orders/{orderId}/messages`) — there is no standalone
 * conversation resource — so this gateway talks to the raw HTTP client.
 *
 * @class CommunicationApi
 * @extends BaseApi
 */
export class CommunicationApi extends BaseApi {
    /**
     * Fetches the message history of an order (backend returns newest-first).
     * @param {number|string} orderId - Order identifier.
     * @param {{ limit?: number, before?: string }} [params] - Optional pagination.
     * @returns {Promise<import('axios').AxiosResponse>} Messages response.
     */
    getMessages(orderId, params = {}) {
        return this.http.get(messagesPath(orderId), { params });
    }

    /**
     * Sends a message in an order's thread.
     * @param {number|string} orderId - Order identifier.
     * @param {{ content: string, senderType: string, senderId: number }} resource - Message payload.
     * @returns {Promise<import('axios').AxiosResponse>} Created message response.
     */
    sendMessage(orderId, resource) {
        return this.http.post(messagesPath(orderId), resource);
    }
}
