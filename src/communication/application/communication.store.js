/**
 * Application service store for the `Communication` bounded context.
 * It coordinates conversation and message use cases and keeps a UI-facing state.
 *
 * @module useCommunicationStore
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CommunicationApi } from '../infrastructure/communication-api.js';
import { ConversationAssembler } from '../infrastructure/conversation.assembler.js';
import { MessageAssembler } from '../infrastructure/message.assembler.js';
import { Conversation } from '../domain/conversation.entity.js';
import { Message } from '../domain/message.entity.js';

const communicationApi = new CommunicationApi();

/**
 * Reactive store that exposes Communication commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useCommunicationStore = defineStore('communication', () => {
    /**
     * List of conversation entities.
     * @type {import('vue').Ref<Conversation[]>}
     */
    const conversations = ref([]);
    /**
     * List of message entities.
     * @type {import('vue').Ref<Message[]>}
     */
    const messages = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether conversations have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const conversationsLoaded = ref(false);
    /**
     * Whether messages have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
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
     * @returns {Conversation|undefined} Matching conversation, if available.
     */
    function getConversationByOrderId(orderId) {
        const idNum = parseInt(orderId);
        return conversations.value.find(c => c.orderId === idNum);
    }

    /**
     * Finds a conversation entity by identifier.
     * @param {number|string} id - Conversation identifier.
     * @returns {Conversation|undefined} Matching conversation, if available.
     */
    function getConversationById(id) {
        const idNum = parseInt(id);
        return conversations.value.find(c => c.id === idNum);
    }

    /**
     * Returns the messages that belong to a conversation, sorted chronologically.
     * @param {number} conversationId - Conversation identifier.
     * @returns {Message[]} Messages of the conversation.
     */
    function getMessagesByConversationId(conversationId) {
        return messages.value
            .filter(m => m.conversationId === conversationId)
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    }

    /**
     * Ensures a conversation exists for an order, creating it on the fly when needed.
     * @param {number} orderId - Order identifier.
     * @returns {Promise<Conversation|undefined>} The conversation associated with the order.
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
     * @returns {Promise<Message|undefined>} The persisted message.
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
