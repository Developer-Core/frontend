/**
 * Application service store for the `Communication` bounded context.
 * It coordinates conversation and message use cases and keeps a UI-facing state.
 *
 * @module useCommunicationStore
 * @returns {Object} Store state and actions.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CommunicationApi } from '../infrastructure/communication-api.js';
import { ConversationAssembler } from '../infrastructure/conversation.assembler.js';
import { MessageAssembler } from '../infrastructure/message.assembler.js';
import { Conversation } from '../domain/conversation.entity.js';

const communicationApi = new CommunicationApi();

const useCommunicationStore = defineStore('communication', () => {
    /** @type {import('vue').Ref<Array<import('../domain/conversation.entity.js').Conversation>>} List of conversation entities. */
    const conversations = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/message.entity.js').Message>>} List of message entities. */
    const messages = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Communication use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Flag indicating if conversations have been loaded. */
    const conversationsLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} Flag indicating if messages have been loaded. */
    const messagesLoaded = ref(false);

    /**
     * Loads conversations from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchConversations() {
        communicationApi.getConversations().then(response => {
            conversations.value = ConversationAssembler.toEntitiesFromResponse(response);
            conversationsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Loads messages from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchMessages() {
        communicationApi.getMessages().then(response => {
            messages.value = MessageAssembler.toEntitiesFromResponse(response);
            messagesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Returns the conversation that belongs to a given order, if any.
     * @param {number|string} orderId - Order identifier.
     * @returns {import('../domain/conversation.entity.js').Conversation|undefined} Matching conversation, if available.
     */
    function getConversationByOrderId(orderId) {
        const idNum = parseInt(orderId);
        return conversations.value.find(c => c.orderId === idNum);
    }

    /**
     * Finds a conversation entity by identifier.
     * @param {number|string} id - Conversation identifier.
     * @returns {import('../domain/conversation.entity.js').Conversation|undefined} Matching conversation, if available.
     */
    function getConversationById(id) {
        const idNum = parseInt(id);
        return conversations.value.find(c => c.id === idNum);
    }

    /**
     * Returns the messages that belong to a conversation, sorted chronologically.
     * @param {number} conversationId - Conversation identifier.
     * @returns {Array<import('../domain/message.entity.js').Message>} Messages of the conversation.
     */
    function getMessagesByConversationId(conversationId) {
        return messages.value
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    }

    /**
     * Ensures a conversation exists for an order, creating it on the fly when needed.
     * @param {number} orderId - Order identifier.
     * @returns {Promise<import('../domain/conversation.entity.js').Conversation|undefined>} The conversation associated with the order.
     */
    async function ensureConversationForOrder(orderId) {
        const existing = getConversationByOrderId(orderId);
        if (existing) return existing;

        try {
            const response = await communicationApi.createConversation({
                orderId,
                lastMessageAt: null
            });
            const created = ConversationAssembler.toEntityFromResource(response.data);
            conversations.value.push(created);
            return created;
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * Persists a new message and refreshes the parent conversation timestamp.
     * @param {import('../domain/send-message.command.js').SendMessageCommand} command - Send-message command.
     * @returns {Promise<import('../domain/message.entity.js').Message|undefined>} The persisted message.
     */
    async function sendMessage(command) {
        try {
            const sentAt = new Date().toISOString();
            const response = await communicationApi.createMessage({
                conversationId: command.conversationId,
                senderName:     command.senderName,
                senderRole:     command.senderRole,
                content:        command.content,
                sentAt
            });
            const persisted = MessageAssembler.toEntityFromResource(response.data);
            messages.value.push(persisted);

            const conversation = getConversationById(command.conversationId);
            if (conversation) {
                const updated = new Conversation({ ...conversation, lastMessageAt: sentAt });
                const stamp = await communicationApi.updateConversation(updated);
                const refreshed = ConversationAssembler.toEntityFromResource(stamp.data);
                const index = conversations.value.findIndex(c => c.id === refreshed.id);
                if (index !== -1) conversations.value[index] = refreshed;
            }

            return persisted;
        } catch (error) {
            errors.value.push(error);
        }
    }

    return {
        conversations,
        messages,
        errors,
        conversationsLoaded,
        messagesLoaded,
        fetchConversations,
        fetchMessages,
        getConversationByOrderId,
        getConversationById,
        getMessagesByConversationId,
        ensureConversationForOrder,
        sendMessage
    };
});

export default useCommunicationStore;
