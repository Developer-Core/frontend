import { StageStatus, STAGE_STATUSES } from './stage-status.js';

/**
 * Normalizes a stage status to its canonical string name. The backend returns
 * the status as an integer on reads (0=Pending, 1=InProgress, 2=Completed) but
 * accepts the string name on writes, so the client keeps the string form.
 * @param {number|string} status - Raw status from the backend.
 * @returns {string} Canonical status name.
 */
const normalizeStatus = (status) =>
    (typeof status === 'number' ? (STAGE_STATUSES[status] ?? StageStatus.PENDING) : (status || StageStatus.PENDING));

/**
 * Stage entity within the Production bounded context. Mirrors the backend
 * `StageResource`: one sequential step in the manufacturing of an order.
 *
 * @class Stage
 */
export class Stage {
    /**
     * @param {Object} [params] - Entity attributes.
     * @param {?number} [params.id] - Stage identifier.
     * @param {string} [params.name] - Stage name (e.g. Corte, Ensamblado, Acabado).
     * @param {number} [params.estimatedTimeInDays] - Planned duration in working days.
     * @param {number} [params.orderIndex] - Position in the production sequence (0-based).
     * @param {string} [params.status] - Current status (Pending | InProgress | Completed).
     * @param {?string} [params.startedAt] - When the stage was started.
     * @param {?string} [params.completedAt] - When the stage was completed.
     */
    constructor({
        id                  = null,
        name                = '',
        estimatedTimeInDays = 0,
        orderIndex          = 0,
        status              = StageStatus.PENDING,
        startedAt           = null,
        completedAt         = null
    } = {}) {
        this.id                  = id;
        this.name                = name;
        this.estimatedTimeInDays = estimatedTimeInDays;
        this.orderIndex          = orderIndex;
        this.status              = normalizeStatus(status);
        this.startedAt           = startedAt;
        this.completedAt         = completedAt;
    }
}
