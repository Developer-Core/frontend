/**
 * Command used by the IAM application layer to register a new carpenter through
 * the closed, invitation-gated flow.
 *
 * @class SignUpCarpenterCommand
 */
export class SignUpCarpenterCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.firstName - Given name for the carpenter's profile.
     * @param {string} params.lastName - Family name for the carpenter's profile.
     * @param {string} params.email - Email that will uniquely identify the carpenter.
     * @param {string} params.password - Plain text password to register.
     * @param {string} params.invitationCode - Invitation code that authorizes carpenter registration.
     */
    constructor({ firstName, lastName, email, password, invitationCode }) {
        this.firstName      = firstName;
        this.lastName       = lastName;
        this.email          = email;
        this.password       = password;
        this.invitationCode = invitationCode;
    }
}
