/**
 * Stage entity within the Production bounded context.
 * Represents one sequential step in the manufacturing of a customer order.
 *
 * @class Stage
 */
export class Stage {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Stage identifier.
     * @param {?number} [params.orderId=null] - Foreign key of the related order.
     * @param {string} [params.name=''] - Stage name (cut, sanding, assembly, finishing).
     * @param {number} [params.sequence=0] - Position of the stage within the production flow.
     * @param {string} [params.status='pending'] - Stage lifecycle status.
     * @param {number} [params.estimatedHours=0] - Hours estimated to complete the stage.
     * @param {number} [params.actualHours=0] - Hours actually spent on the stage.
     */
    constructor({
        id             = null,
        orderId        = null,
        name           = '',
        sequence       = 0,
        status         = 'pending',
        estimatedHours = 0,
        actualHours    = 0
    } = {}) {
        this.id             = id;
        this.orderId        = orderId;
        this.name           = name;
        this.sequence       = sequence;
        this.status         = status;
        this.estimatedHours = estimatedHours;
        this.actualHours    = actualHours;
    }
}
