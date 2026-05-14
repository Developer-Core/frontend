import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const conversationsEndpointPath = import.meta.env.VITE_CONVERSATIONS_ENDPOINT_PATH;
const messagesEndpointPath      = import.meta.env.VITE_MESSAGES_ENDPOINT_PATH;

/**
 * Infrastructure service gateway for the Communication bounded-context endpoints.
 *
 * @class CommunicationApi
 * @extends BaseApi
 */
export class CommunicationApi extends BaseApi {
    #conversationsEndpoint;
    #messagesEndpoint;

    /** Creates the endpoint clients for conversations and messages. */
    constructor() {
        super();
        this.#conversationsEndpoint = new BaseEndpoint(this, conversationsEndpointPath);
        this.#messagesEndpoint      = new BaseEndpoint(this, messagesEndpointPath);
    }

    /**
     * Fetches all conversation resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the conversations response.
     */
    getConversations() {
        return this.#conversationsEndpoint.getAll();
    }

    /**
     * Creates a conversation resource.
     * @param {Object} resource - Conversation resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created conversation response.
     */
    createConversation(resource) {
        return this.#conversationsEndpoint.create(resource);
    }

    /**
     * Updates a conversation resource.
     * @param {Object} resource - Conversation resource payload (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated conversation response.
     */
    updateConversation(resource) {
        return this.#conversationsEndpoint.update(resource.id, resource);
    }

    /**
     * Fetches all message resources.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the messages response.
     */
    getMessages() {
        return this.#messagesEndpoint.getAll();
    }

    /**
     * Creates a message resource.
     * @param {Object} resource - Message resource payload.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created message response.
     */
    createMessage(resource) {
        return this.#messagesEndpoint.create(resource);
    }
}
