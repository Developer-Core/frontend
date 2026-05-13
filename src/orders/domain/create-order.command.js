/**
 * Command used by the Orders application layer to request the creation of a new order.
 *
 * @class CreateOrderCommand
 */
export class CreateOrderCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.projectName - Name describing the furniture piece.
     * @param {string} params.clientName - Client who is requesting the order.
     * @param {string} params.woodType - Wood material selected for the piece.
     * @param {string} params.finish - Surface finish requested by the client.
     * @param {string} params.description - Detailed requirements provided by the client.
     */
    constructor({ projectName, clientName, woodType, finish, description }) {
        this.projectName = projectName;
        this.clientName  = clientName;
        this.woodType    = woodType;
        this.finish      = finish;
        this.description = description;
    }
}
