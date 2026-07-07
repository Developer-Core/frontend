import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const customersPath = import.meta.env.VITE_CUSTOMERS_ENDPOINT_PATH ?? '/customers';

/**
 * Infrastructure gateway for the Customers bounded-context endpoints (`/customers`).
 * The backend exposes list, get-by-id, create and update (PUT); there is no delete.
 *
 * @class CustomersApi
 * @extends BaseApi
 */
export class CustomersApi extends BaseApi {
    #endpoint;

    /** Creates the CRUD endpoint client for customers. */
    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, customersPath);
    }

    /**
     * Fetches all customers.
     * @returns {Promise<import('axios').AxiosResponse>} Customers response.
     */
    getAll() {
        return this.#endpoint.getAll();
    }

    /**
     * Fetches one customer by identifier.
     * @param {number|string} id - Customer identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Customer response.
     */
    getById(id) {
        return this.#endpoint.getById(id);
    }

    /**
     * Creates a customer.
     * @param {Object} resource - CreateCustomerResource ({ firstName, lastName, email, phone, userId? }).
     * @returns {Promise<import('axios').AxiosResponse>} Created customer response.
     */
    create(resource) {
        return this.#endpoint.create(resource);
    }

    /**
     * Updates a customer (PUT).
     * @param {number|string} id - Customer identifier.
     * @param {Object} resource - UpdateCustomerResource ({ firstName, lastName, email, phone }).
     * @returns {Promise<import('axios').AxiosResponse>} Updated customer response.
     */
    update(id, resource) {
        return this.#endpoint.update(id, resource);
    }
}
