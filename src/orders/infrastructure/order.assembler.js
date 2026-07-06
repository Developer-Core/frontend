import { Order } from '../domain/order.entity.js';

/**
 * Maps order resources (the nested backend `OrderResource`) into domain entities.
 *
 * @class OrderAssembler
 */
export class OrderAssembler {
    /**
     * @param {Object} resource - Order resource payload (id, customerId, carpenterId, status, details, quote, payments).
     * @returns {Order} Order entity.
     */
    static toEntityFromResource(resource) {
        return new Order(resource);
    }

    /**
     * Parses a list of order resources from a response into entities.
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with order resources.
     * @returns {Order[]} Order entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : (response.data.orders ?? []);
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
