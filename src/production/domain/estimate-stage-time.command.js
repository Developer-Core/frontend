/**
 * Command used by the Production application layer to assign an estimated time to a stage.
 *
 * @class EstimateStageTimeCommand
 */
export class EstimateStageTimeCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the stage being estimated.
     * @param {number} params.estimatedHours - Hours estimated to complete the stage.
     */
    constructor({ id, estimatedHours }) {
        this.id             = id;
        this.estimatedHours = estimatedHours;
    }
}
