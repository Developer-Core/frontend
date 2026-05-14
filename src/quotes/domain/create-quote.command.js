/**
 * Command used by the Quotes application layer to generate a new quote with its line items.
 *
 * @class CreateQuoteCommand
 */
export class CreateQuoteCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {number} params.orderId - Identifier of the order the quote belongs to.
     * @param {number} params.laborHours - Estimated total labor hours.
     * @param {number} params.hourlyRate - Labor hourly rate applied in the calculation.
     * @param {number} params.marginPercent - Profit margin percentage added on top of the subtotal.
     * @param {Array<{materialId: number, quantity: number, unitCost: number}>} params.items - Material line items.
     */
    constructor({ orderId, laborHours, hourlyRate, marginPercent, items }) {
        this.orderId       = orderId;
        this.laborHours    = laborHours;
        this.hourlyRate    = hourlyRate;
        this.marginPercent = marginPercent;
        this.items         = items;
    }
}
