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

const ordersApi = new OrdersApi();

const useOrdersStore = defineStore('orders', () => {
    /** @type {import('vue').Ref<Array<import('../domain/order.entity.js').Order>>} Loaded orders. */
    const orders = ref([]);
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
     * Creates an order from a flat CreateOrderResource payload.
     * @param {Object} resource - { customerId, carpenterId, furnitureType, width, height, depth, material, designNotes }.
     * @returns {Promise<?import('../domain/order.entity.js').Order>}
     */
    function createOrder(resource) {
        return ordersApi.createOrder(resource).then(absorb).catch(error => { errors.value.push(error); return null; });
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

    /** Accepts a pending order. @param {number|string} id @returns {Promise} */
    function acceptOrder(id) { return ordersApi.acceptOrder(id).then(absorb).catch(error => { errors.value.push(error); }); }
    /** Rejects a pending order. @param {number|string} id @returns {Promise} */
    function rejectOrder(id) { return ordersApi.rejectOrder(id).then(absorb).catch(error => { errors.value.push(error); }); }
    /** Cancels an order. @param {number|string} id @returns {Promise} */
    function cancelOrder(id) { return ordersApi.cancelOrder(id).then(absorb).catch(error => { errors.value.push(error); }); }

    /**
     * Generates the quote for a pending order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - { materialsCost, laborCost, estimatedProductionDays }.
     * @returns {Promise}
     */
    function generateQuote(id, resource) {
        return ordersApi.generateQuote(id, resource).then(absorb).catch(error => { errors.value.push(error); });
    }
    /** Accepts the quote proposed for an order. @param {number|string} id @returns {Promise} */
    function acceptQuote(id) { return ordersApi.acceptQuote(id).then(absorb).catch(error => { errors.value.push(error); }); }

    /**
     * Registers a payment for an order.
     * @param {number|string} id - Order identifier.
     * @param {Object} resource - { type, amount, receiptReference }.
     * @returns {Promise}
     */
    function registerPayment(id, resource) {
        return ordersApi.registerPayment(id, resource).then(absorb).catch(error => { errors.value.push(error); });
    }
    /**
     * Validates a payment receipt.
     * @param {number|string} id - Order identifier.
     * @param {number|string} paymentId - Payment identifier.
     * @param {boolean} isApproved - Whether the receipt is approved.
     * @returns {Promise}
     */
    function validatePayment(id, paymentId, isApproved) {
        return ordersApi.validatePayment(id, paymentId, { isApproved }).then(absorb).catch(error => { errors.value.push(error); });
    }

    return {
        orders, currentOrder, errors, ordersLoaded,
        ordersCount, pendingOrders, inProgressOrders,
        fetchOrders, fetchOrderById, getOrderById,
        createOrder, modifyOrder,
        acceptOrder, rejectOrder, cancelOrder,
        generateQuote, acceptQuote,
        registerPayment, validatePayment
    };
});

export default useOrdersStore;
