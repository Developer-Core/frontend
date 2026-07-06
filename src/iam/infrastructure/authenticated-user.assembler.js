import { AuthenticatedUserResource } from './authenticated-user.resource.js';

/**
 * Maps authentication endpoint responses into IAM infrastructure resources.
 *
 * @class AuthenticatedUserAssembler
 */
export class AuthenticatedUserAssembler {
    /**
     * Parses an authentication response into an {@link AuthenticatedUserResource}.
     * Login returns 200, registration returns 201; both carry the same payload.
     *
     * @param {import('axios').AxiosResponse<Object>} response - HTTP response from an auth endpoint.
     * @returns {AuthenticatedUserResource|null} Parsed resource on success; otherwise null.
     */
    static toResourceFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return null;
        }
        return new AuthenticatedUserResource(response.data);
    }
}
