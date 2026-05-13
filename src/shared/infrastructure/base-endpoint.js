import http from './base-api.js';

/**
 * Base class for all context-specific API endpoints.
 *
 * Provides standard CRUD operations backed by the shared Axios instance.
 * Each bounded context creates its own endpoint by extending this class
 * and passing the resource path.
 *
 * @example
 * // src/orders/infrastructure/orders-api.js
 * import BaseEndpoint from '@/shared/infrastructure/base-endpoint.js';
 * export class OrdersApi extends BaseEndpoint {
 *   constructor() { super('/orders'); }
 * }
 */
class BaseEndpoint {
    /**
     * @param {string} resourcePath - The API resource path (e.g. '/orders').
     */
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }

    /**
     * Fetches all resources.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getAll() {
        return http.get(this.resourcePath);
    }

    /**
     * Fetches a single resource by ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getById(id) {
        return http.get(`${this.resourcePath}/${id}`);
    }

    /**
     * Creates a new resource.
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    create(resource) {
        return http.post(this.resourcePath, resource);
    }

    /**
     * Updates an existing resource.
     * @param {number|string} id
     * @param {Object} resource
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    update(id, resource) {
        return http.put(`${this.resourcePath}/${id}`, resource);
    }

    /**
     * Deletes a resource by ID.
     * @param {number|string} id
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    delete(id) {
        return http.delete(`${this.resourcePath}/${id}`);
    }
}

export default BaseEndpoint;
