/**
 * QuoteItem entity within the Quotes bounded context.
 * Represents a single material line included in a quote, with the quantity and unit cost
 * captured at the moment the quote was prepared.
 *
 * @class QuoteItem
 */
export class QuoteItem {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Line item identifier.
     * @param {?number} [params.quoteId=null] - Foreign key of the related quote.
     * @param {?number} [params.materialId=null] - Foreign key of the related material.
     * @param {number} [params.quantity=0] - Quantity of the material consumed by the order.
     * @param {number} [params.unitCost=0] - Unit cost captured when the line was added.
     */
    constructor({
        id         = null,
        quoteId    = null,
        materialId = null,
        quantity   = 0,
        unitCost   = 0
    } = {}) {
        this.id         = id;
        this.quoteId    = quoteId;
        this.materialId = materialId;
        this.quantity   = quantity;
        this.unitCost   = unitCost;
    }
}
