import { Message } from '../domain/message.entity.js';

/**
 * Maps message resources into domain entities.
 *
 * @class MessageAssembler
 */
export class MessageAssembler {
    /**
     * @param {Object} resource - Message resource payload.
     * @returns {Message} Message entity.
     */
    static toEntityFromResource(resource) {
        return new Message(resource);
    }

    /**
     * Parses a message list from a response into entities, sorted chronologically
     * (oldest first) for thread display — the backend returns them newest-first.
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with message resources.
     * @returns {Message[]} Message entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : (response.data.messages ?? []);
        return resources
            .map(resource => this.toEntityFromResource(resource))
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    }
}
