/**
 * Command used by the Orders application layer to request the modification of a pending order.
 *
 * @class UpdateOrderCommand
 */
export class UpdateOrderCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the order to update.
     * @param {string} params.projectName - New name describing the furniture piece.
     * @param {string} params.woodType - New wood material selection.
     * @param {string} params.finish - New surface finish selection.
     * @param {string} params.description - New detailed requirements provided by the client.
     */
    constructor({ id, projectName, woodType, finish, description }) {
        this.id          = id;
        this.projectName = projectName;
        this.woodType    = woodType;
        this.finish      = finish;
        this.description = description;
    }
}
