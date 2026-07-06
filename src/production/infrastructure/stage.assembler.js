import { Stage } from '../domain/stage.entity.js';

/**
 * Maps stage resources into domain entities.
 *
 * @class StageAssembler
 */
export class StageAssembler {
    /**
     * @param {Object} resource - Stage resource payload.
     * @returns {Stage} Stage entity.
     */
    static toEntityFromResource(resource) {
        return new Stage(resource);
    }

    /**
     * Parses a list of stage resources (array response) into entities, sorted by sequence.
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with stage resources.
     * @returns {Stage[]} Stage entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : (response.data.stages ?? []);
        return resources
            .map(resource => this.toEntityFromResource(resource))
            .sort((a, b) => a.orderIndex - b.orderIndex);
    }
}
