/**
 * Customer aggregate root within the Customers bounded context.
 * Mirrors the backend `CustomerResource`: a workshop client managed by a carpenter.
 *
 * @class Customer
 */
export class Customer {
    /**
     * @param {Object} [params] - Entity attributes.
     * @param {?number} [params.id] - Customer identifier.
     * @param {string} [params.firstName] - Given name.
     * @param {string} [params.lastName] - Family name.
     * @param {string} [params.fullName] - Full name resolved by the backend.
     * @param {string} [params.email] - Contact email.
     * @param {string} [params.phone] - Contact phone number.
     * @param {?number} [params.userId] - Linked user account identifier, when the customer has one.
     */
    constructor({ id = null, firstName = '', lastName = '', fullName = '', email = '', phone = '', userId = null } = {}) {
        this.id        = id;
        this.firstName = firstName;
        this.lastName  = lastName;
        this.fullName  = fullName || `${firstName} ${lastName}`.trim();
        this.email     = email;
        this.phone     = phone;
        this.userId    = userId;
    }
}
