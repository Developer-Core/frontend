/**
 * Conversation aggregate root within the Communication bounded context.
 * Groups all messages exchanged between client and carpenter for a given order.
 *
 * @class Conversation
 */
export class Conversation {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Conversation identifier.
     * @param {?number} [params.orderId=null] - Foreign key of the related order.
     * @param {?string} [params.lastMessageAt=null] - Timestamp of the last message as an ISO string.
     */
    constructor({ id = null, orderId = null, lastMessageAt = null } = {}) {
        this.id            = id;
        this.orderId       = orderId;
        this.lastMessageAt = lastMessageAt;
    }
}
