/**
 * Production stage statuses as returned by the backend (EStageStatus).
 *
 * @readonly
 * @enum {string}
 */
export const StageStatus = {
    PENDING:     'Pending',
    IN_PROGRESS: 'InProgress',
    COMPLETED:   'Completed'
};

/** @type {string[]} All stage statuses in lifecycle order. */
export const STAGE_STATUSES = Object.values(StageStatus);

/**
 * i18n key for a stage status, e.g. 'InProgress' -> 'production.status-in-progress'.
 * @param {string} status - Backend status name.
 * @returns {string} Translation key.
 */
export const stageStatusKey = (status) =>
    `production.status-${String(status || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;

/**
 * PrimeVue Tag severity for a stage status.
 * @param {string} status - Backend status name.
 * @returns {string} PrimeVue severity.
 */
export const stageStatusSeverity = (status) => {
    switch (status) {
        case StageStatus.COMPLETED:   return 'success';
        case StageStatus.IN_PROGRESS: return 'info';
        default:                      return 'secondary';
    }
};
