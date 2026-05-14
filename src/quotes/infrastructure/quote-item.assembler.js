import { QuoteItem } from '../domain/quote-item.entity.js';

/**
 * Maps quote-item resources into domain entities.
 *
 * @class QuoteItemAssembler
 */
export class QuoteItemAssembler {
    /**
     * @param {Object} resource - Quote-item resource payload.
     * @returns {QuoteItem} Quote-item entity.
     */
    static toEntityFromResource(resource) {
        return new QuoteItem({ ...resource });
    }

    /**
     * Parses quote-item resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with quote-item resources.
     * @returns {QuoteItem[]} Quote-item entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['quoteItems'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
