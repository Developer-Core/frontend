/**
 * Command used by the Inventory application layer to register a new material.
 *
 * @class CreateMaterialCommand
 */
export class CreateMaterialCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.name - Material name.
     * @param {string} params.type - Material category.
     * @param {string} params.unit - Measurement unit.
     * @param {number} params.stockQuantity - Initial stock on hand.
     * @param {number} params.minQuantity - Minimum stock threshold.
     * @param {number} params.unitCost - Cost per unit of measure.
     */
    constructor({ name, type, unit, stockQuantity, minQuantity, unitCost }) {
        this.name          = name;
        this.type          = type;
        this.unit          = unit;
        this.stockQuantity = stockQuantity;
        this.minQuantity   = minQuantity;
        this.unitCost      = unitCost;
    }
}
