import { User } from '../domain/user.entity.js';

/**
 * Maps IAM infrastructure resources into domain entities.
 *
 * @class UserAssembler
 */
export class UserAssembler {
    /**
     * @param {Object} resource - Authenticated user resource payload.
     * @returns {User} User entity.
     */
    static toEntityFromResource(resource) {
        return new User({ id: resource.id, email: resource.email, role: resource.role });
    }
}
