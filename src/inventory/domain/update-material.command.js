/**
 * Command used by the Inventory application layer to update a material's metadata.
 *
 * @class UpdateMaterialCommand
 */
export class UpdateMaterialCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the material to update.
     * @param {string} params.name - New material name.
     * @param {string} params.type - New material category.
     * @param {string} params.unit - New measurement unit.
     * @param {number} params.minQuantity - New minimum stock threshold.
     * @param {number} params.unitCost - New cost per unit of measure.
     */
    constructor({ id, name, type, unit, minQuantity, unitCost }) {
        this.id          = id;
        this.name        = name;
        this.type        = type;
        this.unit        = unit;
        this.minQuantity = minQuantity;
        this.unitCost    = unitCost;
    }
}
