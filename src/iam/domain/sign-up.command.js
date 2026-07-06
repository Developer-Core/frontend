/**
 * Command used by the IAM application layer to register a new user.
 *
 * @class SignUpCommand
 */
export class SignUpCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.firstName - Given name for the user's profile.
     * @param {string} params.lastName - Family name for the user's profile.
     * @param {string} params.email - Email that will uniquely identify the user.
     * @param {string} params.password - Plain text password to register.
     * @param {string} params.role - Role chosen at registration (e.g. Client, Carpenter).
     */
    constructor({ firstName, lastName, email, password, role }) {
        this.firstName = firstName;
        this.lastName  = lastName;
        this.email     = email;
        this.password  = password;
        this.role      = role;
    }
}
