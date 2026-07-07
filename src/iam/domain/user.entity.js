/**
 * IAM user aggregate root representation used by the client domain model.
 *
 * @class User
 */
export class User {
    /**
     * @param {Object} params - Entity attributes.
     * @param {string|number} params.id - Unique user identifier.
     * @param {string} params.email - Email address that identifies the user.
     * @param {string} params.role - Role assigned to the user.
     * @param {string} [params.firstName] - Given name (workshop-tool model).
     * @param {string} [params.lastName] - Family name (workshop-tool model).
     * @param {string} [params.fullName] - Full name resolved by the backend.
     */
    constructor({ id, email, role, firstName = '', lastName = '', fullName = '' }) {
        this.id        = id;
        this.email     = email;
        this.role      = role;
        this.firstName = firstName;
        this.lastName  = lastName;
        this.fullName  = fullName || `${firstName} ${lastName}`.trim();
    }
}
