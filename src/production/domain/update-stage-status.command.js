/**
 * Command used by the Production application layer to advance a stage in its lifecycle.
 *
 * @class UpdateStageStatusCommand
 */
export class UpdateStageStatusCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the stage being updated.
     * @param {('pending'|'in-progress'|'completed')} params.status - New stage status.
     * @param {number} [params.actualHours=0] - Hours spent on the stage so far.
     */
    constructor({ id, status, actualHours = 0 }) {
        this.id          = id;
        this.status      = status;
        this.actualHours = actualHours;
    }
}
