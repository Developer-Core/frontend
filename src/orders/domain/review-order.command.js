/**
 * Command used by the Orders application layer to accept or reject a pending order.
 *
 * @class ReviewOrderCommand
 */
export class ReviewOrderCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the order under review.
     * @param {('accepted'|'rejected')} params.decision - Carpenter decision applied to the order.
     */
    constructor({ id, decision }) {
        this.id       = id;
        this.decision = decision;
    }
}
