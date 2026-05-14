/**
 * Application service store for the `Orders` bounded context.
 * It coordinates order use cases and keeps a UI-facing state.
 *
 * @module useOrdersStore
 * @returns {Object} Store state and actions.
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { OrdersApi } from '../infrastructure/orders-api.js';
import { OrderAssembler } from '../infrastructure/order.assembler.js';
import { Order } from '../domain/order.entity.js';

const ordersApi = new OrdersApi();

const useOrdersStore = defineStore('orders', () => {
    /** @type {import('vue').Ref<Array<import('../domain/order.entity.js').Order>>} List of order entities. */
    const orders = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Orders use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Flag indicating if orders have been loaded. */
    const ordersLoaded = ref(false);
    /** @type {import('vue').ComputedRef<number>} Number of loaded orders. */
    const ordersCount = computed(() => ordersLoaded.value ? orders.value.length : 0);
    /** @type {import('vue').ComputedRef<Array<import('../domain/order.entity.js').Order>>} Orders pending review by the carpenter. */
    const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending'));
    /** @type {import('vue').ComputedRef<Array<import('../domain/order.entity.js').Order>>} Orders currently in production. */
    const inProgressOrders = computed(() => orders.value.filter(order => order.status === 'in-progress'));

    /**
     * Loads orders from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchOrders() {
        ordersApi.getOrders().then(response => {
            orders.value = OrderAssembler.toEntitiesFromResponse(response);
            ordersLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds an order entity by identifier.
     * @param {number|string} id - Order identifier.
     * @returns {import('../domain/order.entity.js').Order|undefined} Matching order, if available.
     */
    function getOrderById(id) {
        let idNum = parseInt(id);
        return orders.value.find(order => order['id'] === idNum);
    }

    /**
     * Creates an order through infrastructure and appends it to the local state.
     * @param {import('../domain/order.entity.js').Order} order - Order entity to persist.
     * @returns {void}
     */
    function addOrder(order) {
        ordersApi.createOrder(order).then(response => {
            const resource = response.data;
            const newOrder = OrderAssembler.toEntityFromResource(resource);
            orders.value.push(newOrder);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing order and synchronizes local state.
     * @param {import('../domain/order.entity.js').Order} order - Order entity with updated data.
     * @returns {void}
     */
    function updateOrder(order) {
        ordersApi.updateOrder(order).then(response => {
            const resource = response.data;
            const updatedOrder = OrderAssembler.toEntityFromResource(resource);
            const index = orders.value.findIndex(o => o['id'] === updatedOrder.id);
            if (index !== -1) orders.value[index] = updatedOrder;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes an order and removes it from the local state.
     * @param {import('../domain/order.entity.js').Order} order - Order entity to remove.
     * @returns {void}
     */
    function deleteOrder(order) {
        ordersApi.deleteOrder(order.id).then(() => {
            const index = orders.value.findIndex(o => o['id'] === order.id);
            if (index !== -1) orders.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Applies a carpenter review decision to a pending order.
     * @param {import('../domain/order.entity.js').Order} order - Order entity under review.
     * @param {('accepted'|'rejected')} decision - Carpenter decision.
     * @returns {void}
     */
    function reviewOrder(order, decision) {
        const reviewed = new Order({ ...order, status: decision === 'accepted' ? 'in-progress' : 'cancelled' });
        updateOrder(reviewed);
    }

    /**
     * Cancels an active order on behalf of the client.
     * @param {import('../domain/order.entity.js').Order} order - Order entity to cancel.
     * @returns {void}
     */
    function cancelOrder(order) {
        const cancelled = new Order({ ...order, status: 'cancelled' });
        updateOrder(cancelled);
    }

    return {
        orders,
        errors,
        ordersLoaded,
        ordersCount,
        pendingOrders,
        inProgressOrders,
        fetchOrders,
        getOrderById,
        addOrder,
        updateOrder,
        deleteOrder,
        reviewOrder,
        cancelOrder
    };
});

export default useOrdersStore;
