/**
 * Application service store for the Sales (Orders) bounded context. It coordinates
 * the order lifecycle use cases (create, modify, accept/reject/cancel, quote and
 * payments) and keeps a UI-facing state.
 *
 * @module useOrdersStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { OrdersApi } from '../infrastructure/orders-api.js';
import { OrderAssembler } from '../infrastructure/order.assembler.js';
import { OrderStatus } from '../domain/order-status.js';
import useIamStore from '../../iam/application/iam.store.js';
import { notifySuccess, notifyError } from '../../shared/presentation/app-toast.js';

const ordersApi = new OrdersApi();

const useOrdersStore = defineStore('orders', () => {
    /** @type {import('vue').Ref<Array<import('../domain/order.entity.js').Order>>} Loaded orders (role-scoped by the backend). */
    const orders = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/order.entity.js').Order>>} Unassigned pool orders (carpenter). */
    const poolOrders = ref([]);
    /** @type {import('vue').Ref<?import('../domain/order.entity.js').Order>} Order under detailed view. */
    const currentOrder = ref(null);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Orders use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether orders have been loaded at least once. */
    const ordersLoaded = ref(false);

    const ordersCount      = computed(() => (ordersLoaded.value ? orders.value.length : 0));
    const pendingOrders    = computed(() => orders.value.filter(o => o.status === OrderStatus.PENDING));
    const inProgressOrders = computed(() => orders.value.filter(o => o.status === OrderStatus.IN_PROGRESS));

    /** Replaces (or appends) an order in local state by id. @param {import('../domain/order.entity.js').Order} order */
    function upsert(order) {
        const index = orders.value.findIndex(o => o.id === order.id);
        if (index !== -1) orders.value[index] = order;
        else orders.value.push(order);
    }

    /** Maps an action response to an entity, upserts it, and returns it. @param {import('axios').AxiosResponse} response */
    function absorb(response) {
        const order = OrderAssembler.toEntityFromResource(response.data);
        upsert(order);
        if (currentOrder.value?.id === order.id) currentOrder.value = order;
        return order;
    }

    /**
     * Loads orders, optionally scoped by customer or carpenter.
     * @param {{ customerId?: number, carpenterId?: number }} [filter] - Optional role filter.
     * @returns {Promise<void>}
     */
    function fetchOrders(filter = {}) {
        return ordersApi.getOrders(filter)
            .then(response => {
                orders.value = OrderAssembler.toEntitiesFromResponse(response);
                ordersLoaded.value = true;
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /**
     * Loads a single order into `currentOrder`.
     * @param {number|string} id - Order identifier.
     * @returns {Promise<void>}
     */
    function fetchOrderById(id) {
        return ordersApi.getOrderById(id)
            .then(response => { currentOrder.value = OrderAssembler.toEntityFromResource(response.data); })
            .catch(error => { errors.value.push(error); });
    }

    /** Finds a loaded order by id. @param {number|string} id @returns {import('../domain/order.entity.js').Order|undefined} */
    function getOrderById(id) {
        const idNum = parseInt(id, 10);
        return orders.value.find(o => o.id === idNum);
    }

    /**
     * Loads the unassigned order pool (carpenter-only) into `poolOrders`.
     * @returns {Promise<void>}
     */
    function fetchPool() {
        return ordersApi.getPool()
            .then(response => {
                poolOrders.value = OrderAssembler.toEntitiesFromResponse(response);
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /**
     * Creates an order, arming the payload according to the signed-in role:
     * a Client sends only the furniture fields (the backend derives their customer
     * and leaves the order unassigned); a Carpenter also sends the chosen `customerId`.
     * @param {Object} resource - { customerId?, furnitureType, width, height, depth, material, designNotes }.
     * @returns {Promise<?import('../domain/order.entity.js').Order>}
     */
    function createOrder(resource) {
        const iamStore = useIamStore();
        const details = {
            furnitureType: resource.furnitureType,
            width:         resource.width,
            height:        resource.height,
            depth:         resource.depth,
            material:      resource.material,
            designNotes:   resource.designNotes
        };
        const payload = iamStore.currentRole === 'Carpenter'
            ? { customerId: resource.customerId, ...details }
            : details;
        return ordersApi.createOrder(payload)
            .then(response => { const order = absorb(response); notifySuccess('toast.order-created'); return order; })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); return null; });
    }

    /**
     * Modifies the furniture details of a pending order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - UpdateOrderResource payload.
     * @returns {Promise<?import('../domain/order.entity.js').Order>}
     */
    function modifyOrder(id, resource) {
        return ordersApi.modifyOrder(id, resource).then(absorb).catch(error => { errors.value.push(error); return null; });
    }

    /** Claims a pool order and accepts it. Also drops it from `poolOrders`. @param {number|string} id @returns {Promise} */
    function acceptOrder(id) {
        return ordersApi.acceptOrder(id)
            .then(response => {
                const order = absorb(response);
                poolOrders.value = poolOrders.value.filter(o => o.id !== order.id);
                notifySuccess('toast.order-accepted');
                return order;
            })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); });
    }
    /** Rejects a pending order. @param {number|string} id @returns {Promise} */
    function rejectOrder(id) { return ordersApi.rejectOrder(id).then(response => { const o = absorb(response); notifySuccess('toast.order-rejected'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }
    /** Cancels an order. @param {number|string} id @returns {Promise} */
    function cancelOrder(id) { return ordersApi.cancelOrder(id).then(response => { const o = absorb(response); notifySuccess('toast.order-cancelled'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }

    /** Starts production of an accepted order (carpenter). @param {number|string} id @returns {Promise} */
    function startProduction(id) { return ordersApi.startProduction(id).then(response => { const o = absorb(response); notifySuccess('toast.production-started'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }
    /** Marks an in-progress order ready for delivery (carpenter). @param {number|string} id @returns {Promise} */
    function markReady(id) { return ordersApi.markReady(id).then(response => { const o = absorb(response); notifySuccess('toast.order-ready'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }
    /** Completes/delivers a ready order (carpenter). @param {number|string} id @returns {Promise} */
    function completeOrder(id) { return ordersApi.completeOrder(id).then(response => { const o = absorb(response); notifySuccess('toast.order-completed'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }

    /**
     * Generates the quote for a pending order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - { materialsCost, laborCost, estimatedProductionDays }.
     * @returns {Promise}
     */
    function generateQuote(id, resource) {
        return ordersApi.generateQuote(id, resource).then(response => { const o = absorb(response); notifySuccess('toast.quote-generated'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); });
    }
    /** Accepts the quote proposed for an order. @param {number|string} id @returns {Promise} */
    function acceptQuote(id) { return ordersApi.acceptQuote(id).then(response => { const o = absorb(response); notifySuccess('toast.quote-accepted'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); }); }

    /**
     * Registers a payment for an order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - { type, amount, receiptReference }.
     * @returns {Promise}
     */
    function registerPayment(id, resource) {
        return ordersApi.registerPayment(id, resource).then(response => { const o = absorb(response); notifySuccess('toast.payment-registered'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); });
    }
    /**
     * Validates a payment receipt.
     * @param {number|string} id - Order identifier.
     * @param {number|string} paymentId - Payment identifier.
     * @param {boolean} isApproved - Whether the receipt is approved.
     * @returns {Promise}
     */
    function validatePayment(id, paymentId, isApproved) {
        return ordersApi.validatePayment(id, paymentId, { isApproved }).then(response => { const o = absorb(response); notifySuccess('toast.payment-validated'); return o; }).catch(error => { errors.value.push(error); notifyError('toast.action-failed'); });
    }

    return {
        orders, poolOrders, currentOrder, errors, ordersLoaded,
        ordersCount, pendingOrders, inProgressOrders,
        fetchOrders, fetchPool, fetchOrderById, getOrderById,
        createOrder, modifyOrder,
        acceptOrder, rejectOrder, cancelOrder,
        startProduction, markReady, completeOrder,
        generateQuote, acceptQuote,
        registerPayment, validatePayment
    };
});

export default useOrdersStore;
