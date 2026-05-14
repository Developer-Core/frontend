/**
 * Message entity within the Communication bounded context.
 * Represents a single text message exchanged within a conversation.
 *
 * @class Message
 */
export class Message {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Message identifier.
     * @param {?number} [params.conversationId=null] - Foreign key of the related conversation.
     * @param {string} [params.senderName=''] - Display name of the sender.
     * @param {('client'|'carpenter')} [params.senderRole='client'] - Role of the sender.
     * @param {string} [params.content=''] - Plain-text body of the message.
     * @param {?string} [params.sentAt=null] - Send timestamp as an ISO string.
     */
    constructor({
        id             = null,
        conversationId = null,
        senderName     = '',
        senderRole     = 'client',
        content        = '',
        sentAt         = null
    } = {}) {
        this.id             = id;
        this.conversationId = conversationId;
        this.senderName     = senderName;
        this.senderRole     = senderRole;
        this.content        = content;
        this.sentAt         = sentAt;
    }
}
