/**
 * Command used by the Communication application layer to send a new message in a conversation.
 *
 * @class SendMessageCommand
 */
export class SendMessageCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.conversationId - Identifier of the target conversation.
     * @param {string} params.senderName - Display name of the sender.
     * @param {('client'|'carpenter')} params.senderRole - Role of the sender.
     * @param {string} params.content - Plain-text body of the message.
     */
    constructor({ conversationId, senderName, senderRole, content }) {
        this.conversationId = conversationId;
        this.senderName     = senderName;
        this.senderRole     = senderRole;
        this.content        = content;
    }
}
