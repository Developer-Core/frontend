/** Canonical quote statuses in backend enum order (EQuoteStatus). */
const QUOTE_STATUSES = ['Proposed', 'Accepted', 'Rejected'];

/**
 * Normalizes a quote status to its canonical string name. The backend may
 * serialize the enum as an integer (0=Proposed, 1=Accepted, 2=Rejected); the
 * client keeps the string form for display.
 * @param {number|string} status - Raw status from the backend.
 * @returns {string} Canonical status name.
 */
const normalizeStatus = (status) =>
    (typeof status === 'number' ? (QUOTE_STATUSES[status] ?? 'Proposed') : (status || ''));

/**
 * Quote sub-resource of an order. Mirrors the backend `QuoteResource`.
 *
 * @class Quote
 */
export class Quote {
    /**
     * @param {Object} [params] - Quote attributes.
     * @param {?number} [params.id] - Quote identifier.
     * @param {number} [params.materialsCost] - Cost of materials.
     * @param {number} [params.laborCost] - Cost of labor.
     * @param {number} [params.total] - Total quoted cost.
     * @param {number} [params.estimatedProductionDays] - Estimated production days.
     * @param {string} [params.status] - Quote status.
     */
    constructor({ id = null, materialsCost = 0, laborCost = 0, total = 0, estimatedProductionDays = 0, status = '' } = {}) {
        this.id                      = id;
        this.materialsCost           = materialsCost;
        this.laborCost               = laborCost;
        this.total                   = total;
        this.estimatedProductionDays = estimatedProductionDays;
        this.status                  = normalizeStatus(status);
    }
}
