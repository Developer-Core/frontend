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
     */
    constructor({ id, email, role }) {
        this.id    = id;
        this.email = email;
        this.role  = role;
    }
}
