/**
 * Quote aggregate root within the Quotes bounded context.
 * Represents the cost breakdown and profitability proposal a carpenter prepares for an order.
 *
 * @class Quote
 */
export class Quote {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Quote identifier.
     * @param {?number} [params.orderId=null] - Foreign key of the related order.
     * @param {string} [params.status='draft'] - Quote lifecycle status (draft, sent, accepted, rejected).
     * @param {number} [params.laborHours=0] - Estimated total labor hours.
     * @param {number} [params.hourlyRate=0] - Labor hourly rate applied in the calculation.
     * @param {number} [params.marginPercent=0] - Profit margin percentage added on top of the subtotal.
     * @param {?string} [params.createdAt=null] - Creation timestamp as an ISO string.
     */
    constructor({
        id            = null,
        orderId       = null,
        status        = 'draft',
        laborHours    = 0,
        hourlyRate    = 0,
        marginPercent = 0,
        createdAt     = null
    } = {}) {
        this.id            = id;
        this.orderId       = orderId;
        this.status        = status;
        this.laborHours    = laborHours;
        this.hourlyRate    = hourlyRate;
        this.marginPercent = marginPercent;
        this.createdAt     = createdAt;
    }
}
