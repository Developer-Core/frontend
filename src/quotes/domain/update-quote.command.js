/**
 * Command used by the Quotes application layer to update an existing quote.
 *
 * @class UpdateQuoteCommand
 */
export class UpdateQuoteCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.id - Identifier of the quote being updated.
     * @param {string} params.status - New quote lifecycle status.
     * @param {number} params.laborHours - Updated labor hours estimate.
     * @param {number} params.hourlyRate - Updated labor hourly rate.
     * @param {number} params.marginPercent - Updated profit margin percentage.
     */
    constructor({ id, status, laborHours, hourlyRate, marginPercent }) {
        this.id            = id;
        this.status        = status;
        this.laborHours    = laborHours;
        this.hourlyRate    = hourlyRate;
        this.marginPercent = marginPercent;
    }
}
