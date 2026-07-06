/** Canonical payment types / statuses in backend enum order. */
const PAYMENT_TYPES    = ['Deposit', 'FinalPayment'];
const PAYMENT_STATUSES = ['PendingValidation', 'Confirmed', 'Rejected'];

/**
 * Normalizes an enum value that the backend may serialize as an integer on reads
 * into its canonical string name, keeping the string form on the client.
 * @param {number|string} value - Raw value from the backend.
 * @param {string[]} names - Ordered canonical names.
 * @returns {string} Canonical name.
 */
const normalize = (value, names) =>
    (typeof value === 'number' ? (names[value] ?? '') : (value || ''));

/**
 * Payment sub-resource of an order. Mirrors the backend `PaymentResource`.
 *
 * @class Payment
 */
export class Payment {
    /**
     * @param {Object} [params] - Payment attributes.
     * @param {?number} [params.id] - Payment identifier.
     * @param {string} [params.type] - Payment type (Deposit | FinalPayment).
     * @param {number} [params.amount] - Payment amount.
     * @param {string} [params.receiptReference] - Receipt reference provided by the customer.
     * @param {string} [params.status] - Payment status (PendingValidation | Confirmed | Rejected).
     */
    constructor({ id = null, type = '', amount = 0, receiptReference = '', status = '' } = {}) {
        this.id               = id;
        this.type             = normalize(type, PAYMENT_TYPES);
        this.amount           = amount;
        this.receiptReference = receiptReference;
        this.status           = normalize(status, PAYMENT_STATUSES);
    }
}

/**
 * Backend EPaymentType is serialized as an integer on write: Deposit = 0, FinalPayment = 1.
 * @readonly
 * @enum {number}
 */
export const PaymentType = { DEPOSIT: 0, FINAL_PAYMENT: 1 };

/**
 * i18n key for a payment type, e.g. 'FinalPayment' -> 'orders.payment-type-final-payment'.
 * @param {string} type - Backend payment type name.
 * @returns {string} Translation key.
 */
export const paymentTypeKey = (type) =>
    `orders.payment-type-${String(normalize(type, PAYMENT_TYPES) || '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()}`;

/**
 * i18n key for a payment status, e.g. 'PendingValidation' -> 'orders.payment-status-pending-validation'.
 * @param {string} status - Backend payment status name.
 * @returns {string} Translation key.
 */
export const paymentStatusKey = (status) =>
    `orders.payment-status-${String(normalize(status, PAYMENT_STATUSES) || '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase()}`;

/**
 * PrimeVue Tag severity for a payment status.
 * @param {string} status - Backend payment status name.
 * @returns {string} PrimeVue severity.
 */
export const paymentStatusSeverity = (status) => {
    switch (normalize(status, PAYMENT_STATUSES)) {
        case 'PendingValidation': return 'warn';
        case 'Confirmed': return 'success';
        case 'Rejected': return 'danger';
        default: return 'contrast';
    }
};
