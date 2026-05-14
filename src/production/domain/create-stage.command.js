/**
 * Command used by the Production application layer to add a new stage to a production flow.
 *
 * @class CreateStageCommand
 */
export class CreateStageCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.orderId - Identifier of the order this stage belongs to.
     * @param {string} params.name - Name of the stage being defined.
     * @param {number} params.sequence - Position of the stage within the production flow.
     * @param {number} params.estimatedHours - Hours estimated to complete the stage.
     */
    constructor({ orderId, name, sequence, estimatedHours }) {
        this.orderId        = orderId;
        this.name           = name;
        this.sequence       = sequence;
        this.estimatedHours = estimatedHours;
    }
}
