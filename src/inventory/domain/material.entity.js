/**
 * Material aggregate root within the Inventory bounded context.
 * Represents a raw material or consumable physically available in the workshop.
 *
 * @class Material
 */
export class Material {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Material identifier.
     * @param {string} [params.name=''] - Material name (e.g. Roble, Bisagras 90°).
     * @param {string} [params.type=''] - Material category (wood, hardware, finish, consumable).
     * @param {string} [params.unit=''] - Measurement unit (m, kg, units, l, m2).
     * @param {number} [params.stockQuantity=0] - Current stock on hand.
     * @param {number} [params.minQuantity=0] - Minimum stock threshold that triggers a low-stock alert.
     * @param {number} [params.unitCost=0] - Cost per unit of measure.
     */
    constructor({
        id            = null,
        name          = '',
        type          = '',
        unit          = '',
        stockQuantity = 0,
        minQuantity   = 0,
        unitCost      = 0
    } = {}) {
        this.id            = id;
        this.name          = name;
        this.type          = type;
        this.unit          = unit;
        this.stockQuantity = stockQuantity;
        this.minQuantity   = minQuantity;
        this.unitCost      = unitCost;
    }
}
