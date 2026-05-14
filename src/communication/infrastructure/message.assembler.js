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
        return new Message({ ...resource });
    }

    /**
     * Parses message resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with message resources.
     * @returns {Message[]} Message entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['messages'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
