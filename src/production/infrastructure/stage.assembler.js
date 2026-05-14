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
        return new Stage({ ...resource });
    }

    /**
     * Parses stage resources from a response and maps them into entities.
     *
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response with stage resources.
     * @returns {Stage[]} Stage entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['stages'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
