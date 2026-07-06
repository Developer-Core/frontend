/**
 * Furniture details value object describing the piece requested in an order.
 * Mirrors the backend `FurnitureDetailsResource`. Dimensions are in centimeters.
 *
 * @class FurnitureDetails
 */
export class FurnitureDetails {
    /**
     * @param {Object} [params] - Value object attributes.
     * @param {string} [params.furnitureType] - Type of furniture requested.
     * @param {number} [params.width] - Width in centimeters.
     * @param {number} [params.height] - Height in centimeters.
     * @param {number} [params.depth] - Depth in centimeters.
     * @param {string} [params.material] - Requested material.
     * @param {string} [params.designNotes] - Additional design notes.
     */
    constructor({ furnitureType = '', width = null, height = null, depth = null, material = '', designNotes = '' } = {}) {
        this.furnitureType = furnitureType;
        this.width         = width;
        this.height        = height;
        this.depth         = depth;
        this.material      = material;
        this.designNotes   = designNotes;
    }
}
