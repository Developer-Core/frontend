import { Quote } from '../domain/quote.entity.js';

/**
 * Maps quote resources into domain entities.
 *
 * @class QuoteAssembler
 */
export class QuoteAssembler {
    /**
     * @param {Object} resource - Quote resource payload.
     * @returns {Quote} Quote entity.
     */
    static toEntityFromResource(resource) {
        return new Quote({ ...resource });
    }

    /**
     * Parses quote resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with quote resources.
     * @returns {Quote[]} Quote entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['quotes'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
