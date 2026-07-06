import { Material } from '../domain/material.entity.js';

/**
 * Maps inventory material resources into domain entities.
 *
 * @class MaterialAssembler
 */
export class MaterialAssembler {
    /**
     * @param {Object} resource - Material resource payload ({ id, materialType, quantity, unit, minStock }).
     * @returns {Material} Material entity.
     */
    static toEntityFromResource(resource) {
        return new Material(resource);
    }

    /**
     * Parses a list of material resources from a response into entities.
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with material resources.
     * @returns {Material[]} Material entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : (response.data.materials ?? []);
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
