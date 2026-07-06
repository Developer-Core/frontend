import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const signInEndpointPath = import.meta.env.VITE_AUTH_SIGNIN_ENDPOINT_PATH;
const signUpEndpointPath = import.meta.env.VITE_AUTH_SIGNUP_ENDPOINT_PATH;

/**
 * Infrastructure gateway for the IAM bounded-context endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #signInEndpoint;
    #signUpEndpoint;

    /** Creates the endpoint clients for sign-in and sign-up. */
    constructor() {
        super();
        this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
        this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
    }

    /**
     * Sends a sign-in command to `POST /auth/login`.
     * @param {import('../domain/sign-in.command.js').SignInCommand} signInCommand - Credentials.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the authenticated user payload.
     */
    signIn(signInCommand) {
        return this.#signInEndpoint.create(signInCommand);
    }

    /**
     * Sends a sign-up command to `POST /auth/register`.
     * @param {import('../domain/sign-up.command.js').SignUpCommand} signUpCommand - Registration data.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the authenticated user payload.
     */
    signUp(signUpCommand) {
        return this.#signUpEndpoint.create(signUpCommand);
    }

    /**
     * Sends a carpenter sign-up command to `POST /auth/sign-up-carpenter`.
     * This is the closed, invitation-gated registration flow: the backend rejects
     * the request with 403 when the invitation code is invalid and forces the role
     * to Carpenter server-side.
     * @param {import('../domain/sign-up-carpenter.command.js').SignUpCarpenterCommand} command - Registration data + invitation code.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with the authenticated user payload.
     */
    signUpCarpenter(command) {
        return this.http.post('/auth/sign-up-carpenter', {
            email:          command.email,
            password:       command.password,
            invitationCode: command.invitationCode
        });
    }

    /**
     * Fetches the user directory from `GET /users`, optionally filtered by role.
     * @param {?string} [role] - Role filter (e.g. 'Carpenter').
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with user resources.
     */
    getUsers(role = null) {
        return this.http.get('/users', { params: role ? { role } : {} });
    }

    /**
     * Creates the personal profile for a freshly-registered user (`POST /profiles`).
     * Runs right after registration, before the session is stored, so the just-issued
     * token is passed explicitly for authorization.
     * @param {{ firstName: string, lastName: string, email: string }} resource - Profile payload.
     * @param {string} token - Bearer token issued by the registration response.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} Created profile response.
     */
    createProfile(resource, token) {
        return this.http.post('/profiles', resource, { headers: { Authorization: `Bearer ${token}` } });
    }

    /**
     * Fetches all profiles from `GET /profiles` (used to resolve user display names).
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} HTTP response with profile resources.
     */
    getProfiles() {
        return this.http.get('/profiles');
    }
}
