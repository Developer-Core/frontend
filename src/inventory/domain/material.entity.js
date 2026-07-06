/**
 * Material aggregate root within the Inventory bounded context.
 * Mirrors the backend `InventoryMaterialResource`: a raw material or consumable
 * physically available in the workshop.
 *
 * @class Material
 */
export class Material {
    /**
     * @param {Object} [params] - Entity attributes.
     * @param {?number} [params.id] - Material identifier.
     * @param {string} [params.materialType] - Material type/name (e.g. Roble, Bisagras 90°).
     * @param {number} [params.quantity] - Current stock on hand.
     * @param {string} [params.unit] - Measurement unit (m, kg, units, l, m2).
     * @param {number} [params.minStock] - Minimum stock threshold that triggers a low-stock alert.
     */
    constructor({ id = null, materialType = '', quantity = 0, unit = '', minStock = 0 } = {}) {
        this.id           = id;
        this.materialType = materialType;
        this.quantity     = quantity;
        this.unit         = unit;
        this.minStock     = minStock;
    }

    /** @returns {boolean} Whether the material is at or below its minimum stock threshold. */
    get isLowStock() { return this.quantity <= this.minStock; }
}
