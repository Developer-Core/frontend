/**
 * Order aggregate root within the Orders bounded context.
 *
 * @class Order
 */
export class Order {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Order identifier.
     * @param {string} [params.projectName=''] - Name describing the furniture piece.
     * @param {string} [params.clientName=''] - Client who requested the order.
     * @param {string} [params.woodType=''] - Wood material selected for the piece.
     * @param {string} [params.finish=''] - Surface finish requested by the client.
     * @param {string} [params.description=''] - Detailed requirements provided by the client.
     * @param {string} [params.status='pending'] - Order lifecycle status.
     * @param {?string} [params.startDate=null] - Production start date as an ISO string.
     * @param {?string} [params.endDate=null] - Expected delivery date as an ISO string.
     */
    constructor({
        id          = null,
        projectName = '',
        clientName  = '',
        woodType    = '',
        finish      = '',
        description = '',
        status      = 'pending',
        startDate   = null,
        endDate     = null
    } = {}) {
        this.id          = id;
        this.projectName = projectName;
        this.clientName  = clientName;
        this.woodType    = woodType;
        this.finish      = finish;
        this.description = description;
        this.status      = status;
        this.startDate   = startDate;
        this.endDate     = endDate;
    }
}
