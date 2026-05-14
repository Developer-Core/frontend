import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const quotesEndpointPath     = import.meta.env.VITE_QUOTES_ENDPOINT_PATH;
const quoteItemsEndpointPath = import.meta.env.VITE_QUOTE_ITEMS_ENDPOINT_PATH;

/**
 * Infrastructure service gateway for the Quotes bounded-context endpoints.
 *
 * @class QuotesApi
 * @extends BaseApi
 */
export class QuotesApi extends BaseApi {
    #quotesEndpoint;
    #quoteItemsEndpoint;

    /** Creates the endpoint clients for quotes and quote items. */
    constructor() {
        super();
        this.#quotesEndpoint     = new BaseEndpoint(this, quotesEndpointPath);
        this.#quoteItemsEndpoint = new BaseEndpoint(this, quoteItemsEndpointPath);
    }

    /**
     * Fetches all quote resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the quotes response.
     */
    getQuotes() {
        return this.#quotesEndpoint.getAll();
    }

    /**
     * Fetches one quote resource by identifier.
     * @param {number|string} id - Quote identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the quote response.
     */
    getQuoteById(id) {
        return this.#quotesEndpoint.getById(id);
    }

    /**
     * Creates a quote resource.
     * @param {Object} resource - Quote resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created quote response.
     */
    createQuote(resource) {
        return this.#quotesEndpoint.create(resource);
    }

    /**
     * Updates a quote resource.
     * @param {Object} resource - Quote resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated quote response.
     */
    updateQuote(resource) {
        return this.#quotesEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a quote resource by identifier.
     * @param {number|string} id - Quote identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteQuote(id) {
        return this.#quotesEndpoint.delete(id);
    }

    /**
     * Fetches all quote-item resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the quote items response.
     */
    getQuoteItems() {
        return this.#quoteItemsEndpoint.getAll();
    }

    /**
     * Creates a quote-item resource.
     * @param {Object} resource - Quote-item resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created item response.
     */
    createQuoteItem(resource) {
        return this.#quoteItemsEndpoint.create(resource);
    }

    /**
     * Deletes a quote-item resource by identifier.
     * @param {number|string} id - Quote-item identifier.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteQuoteItem(id) {
        return this.#quoteItemsEndpoint.delete(id);
    }
}
