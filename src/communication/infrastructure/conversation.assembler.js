import { Conversation } from '../domain/conversation.entity.js';

/**
 * Maps conversation resources into domain entities.
 *
 * @class ConversationAssembler
 */
export class ConversationAssembler {
    /**
     * @param {Object} resource - Conversation resource payload.
     * @returns {Conversation} Conversation entity.
     */
    static toEntityFromResource(resource) {
        return new Conversation({ ...resource });
    }

    /**
     * Parses conversation resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with conversation resources.
     * @returns {Conversation[]} Conversation entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['conversations'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
