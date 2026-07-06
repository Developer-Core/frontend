/**
 * Application service store for the Communication (Engagement) bounded context.
 * Messages belong to a single order's thread, so the store holds the messages of
 * the order currently open and coordinates loading and sending.
 *
 * @module useCommunicationStore
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CommunicationApi } from '../infrastructure/communication-api.js';
import { MessageAssembler } from '../infrastructure/message.assembler.js';

const communicationApi = new CommunicationApi();

const useCommunicationStore = defineStore('communication', () => {
    /** @type {import('vue').Ref<Array<import('../domain/message.entity.js').Message>>} Messages of the open order. */
    const messages = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether the message history has loaded for the open order. */
    const messagesLoaded = ref(false);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Communication use-case execution. */
    const errors = ref([]);

    /**
     * Loads the message history of an order.
     * @param {number|string} orderId - Order identifier.
     * @returns {Promise<void>}
     */
    function fetchMessages(orderId) {
        messagesLoaded.value = false;
        return communicationApi.getMessages(orderId)
            .then(response => {
                messages.value = MessageAssembler.toEntitiesFromResponse(response);
                messagesLoaded.value = true;
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /**
     * Sends a message in an order's thread and appends it to the local state.
     * @param {number|string} orderId - Order identifier.
     * @param {{ content: string, senderType: string, senderId: number }} resource - Message payload.
     * @returns {Promise<void>}
     */
    function sendMessage(orderId, resource) {
        return communicationApi.sendMessage(orderId, resource)
            .then(response => { messages.value.push(MessageAssembler.toEntityFromResource(response.data)); })
            .catch(error => { errors.value.push(error); });
    }

    return { messages, messagesLoaded, errors, fetchMessages, sendMessage };
});

export default useCommunicationStore;
