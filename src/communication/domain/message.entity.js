/**
 * Message entity within the Communication (Engagement) bounded context.
 * Mirrors the backend `MessageResource`: a single message in an order's thread.
 *
 * @class Message
 */
export class Message {
    /**
     * @param {Object} [params] - Entity attributes.
     * @param {?number} [params.id] - Message identifier.
     * @param {string} [params.content] - Plain-text body of the message.
     * @param {string} [params.senderType] - Who sent it: 'Client' or 'Workshop'.
     * @param {?number} [params.senderId] - Id of the user who sent the message.
     * @param {?string} [params.sentAt] - Send timestamp (ISO string).
     */
    constructor({ id = null, content = '', senderType = '', senderId = null, sentAt = null } = {}) {
        this.id         = id;
        this.content    = content;
        this.senderType = senderType;
        this.senderId   = senderId;
        this.sentAt     = sentAt;
    }

    /** @returns {boolean} Whether the message was sent by the workshop (carpenter). */
    get isFromWorkshop() { return this.senderType === 'Workshop'; }
}

/** Sender types accepted by the backend. @readonly @enum {string} */
export const SenderType = { CLIENT: 'Client', WORKSHOP: 'Workshop' };
