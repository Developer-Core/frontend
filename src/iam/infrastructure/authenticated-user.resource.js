/**
 * Infrastructure resource returned by the authentication endpoints
 * (`/auth/login` and `/auth/register`).
 *
 * @class AuthenticatedUserResource
 */
export class AuthenticatedUserResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Authenticated user identifier.
     * @param {string} params.email - Authenticated user email.
     * @param {string} params.role - Authenticated user role.
     * @param {string} params.token - Bearer JWT token.
     */
    constructor({ id, email, role, token }) {
        this.id    = id;
        this.email = email;
        this.role  = role;
        this.token = token;
    }
}
