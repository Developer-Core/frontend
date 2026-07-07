import { FurnitureDetails } from './furniture-details.entity.js';
import { Quote } from './quote.entity.js';
import { Payment } from './payment.entity.js';
import { OrderStatus } from './order-status.js';

/**
 * Order aggregate root within the Sales (Orders) bounded context.
 * Mirrors the backend `OrderResource`: a customer/carpenter pair, the furniture
 * details, and the optional quote and payment sub-resources.
 *
 * @class Order
 */
export class Order {
    /**
     * @param {Object} [params] - Entity attributes.
     * @param {?number} [params.id] - Order identifier.
     * @param {?string} [params.publicTrackingId] - Public tracking GUID.
     * @param {?number} [params.customerId] - Customer (user) identifier.
     * @param {?number} [params.carpenterId] - Carpenter (user) identifier.
     * @param {string} [params.status] - Order status.
     * @param {Object} [params.details] - Furniture details payload.
     * @param {?Object} [params.quote] - Quote payload, if any.
     * @param {Array<Object>} [params.payments] - Payment payloads.
     * @param {number} [params.completedStages] - Number of production stages completed.
     * @param {number} [params.totalStages] - Total number of production stages defined.
     */
    constructor({
        id               = null,
        publicTrackingId = null,
        customerId       = null,
        carpenterId      = null,
        status           = OrderStatus.PENDING,
        details          = {},
        quote            = null,
        payments         = [],
        completedStages  = 0,
        totalStages      = 0
    } = {}) {
        this.id               = id;
        this.publicTrackingId = publicTrackingId;
        this.customerId       = customerId;
        this.carpenterId      = carpenterId;
        this.status           = status;
        this.details          = new FurnitureDetails(details ?? {});
        this.quote            = quote ? new Quote(quote) : null;
        this.payments         = (payments ?? []).map(payment => new Payment(payment));
        this.completedStages  = completedStages;
        this.totalStages      = totalStages;
    }

    /** @returns {boolean} Whether the order is still pending review. */
    get isPending() { return this.status === OrderStatus.PENDING; }

    /** @returns {boolean} Whether the order can still be cancelled. */
    get isCancellable() {
        return ![OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(this.status);
    }
}
