/**
 * Command used by the Inventory application layer to add or consume stock for a material.
 *
 * @class AdjustStockCommand
 */
export class AdjustStockCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the material being adjusted.
     * @param {number} params.delta - Signed quantity to apply (positive to restock, negative to consume).
     * @param {string} [params.reason=''] - Optional human-readable justification for the adjustment.
     */
    constructor({ id, delta, reason = '' }) {
        this.id     = id;
        this.delta  = delta;
        this.reason = reason;
    }
}
