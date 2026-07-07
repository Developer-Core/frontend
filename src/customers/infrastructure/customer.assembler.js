import { Customer } from '../domain/customer.entity.js';

/**
 * Maps customer resources into domain entities.
 *
 * @class CustomerAssembler
 */
export class CustomerAssembler {
    /**
     * @param {Object} resource - Customer resource payload ({ id, firstName, lastName, fullName, email, phone, userId }).
     * @returns {Customer} Customer entity.
     */
    static toEntityFromResource(resource) {
        return new Customer(resource);
    }

    /**
     * Parses a list of customer resources from a response into entities.
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with customer resources.
     * @returns {Customer[]} Customer entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : (response.data.customers ?? []);
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
