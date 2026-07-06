/**
 * Order lifecycle statuses as returned by the backend (EOrderStatus).
 * The backend serializes the enum as its string name.
 *
 * @readonly
 * @enum {string}
 */
export const OrderStatus = {
    PENDING:            'Pending',
    ACCEPTED:           'Accepted',
    IN_PROGRESS:        'InProgress',
    READY_FOR_DELIVERY: 'ReadyForDelivery',
    COMPLETED:          'Completed',
    CANCELLED:          'Cancelled',
    REJECTED:           'Rejected'
};

/** All order statuses in lifecycle order. @type {string[]} */
export const ORDER_STATUSES = Object.values(OrderStatus);

/**
 * i18n key suffix for a given status, e.g. 'Pending' -> 'orders.status-pending'.
 * @param {string} status - Backend status name.
 * @returns {string} Translation key.
 */
export const orderStatusKey = (status) =>
    `orders.status-${String(status || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;

/**
 * PrimeVue Tag severity for a given order status, for consistent status badges.
 * @param {string} status - Backend status name.
 * @returns {string} PrimeVue severity.
 */
export const orderStatusSeverity = (status) => {
    switch (status) {
        case OrderStatus.PENDING:            return 'warn';
        case OrderStatus.ACCEPTED:           return 'info';
        case OrderStatus.IN_PROGRESS:        return 'info';
        case OrderStatus.READY_FOR_DELIVERY: return 'info';
        case OrderStatus.COMPLETED:          return 'success';
        case OrderStatus.CANCELLED:          return 'secondary';
        case OrderStatus.REJECTED:           return 'danger';
        default:                             return 'secondary';
    }
};
