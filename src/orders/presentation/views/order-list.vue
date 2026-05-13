<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import useOrdersStore from '../../application/orders.store.js';
import { onMounted, toRefs } from 'vue';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useOrdersStore();
const { orders, ordersLoaded, errors } = toRefs(store);
const { fetchOrders, cancelOrder, reviewOrder } = store;

onMounted(() => {
    if (!store.ordersLoaded) fetchOrders();
});

/**
 * Maps an order status to the PrimeVue tag severity.
 * @param {string} status - Order status value.
 * @returns {string} PrimeVue severity name.
 */
const severityFor = (status) => {
    switch (status) {
        case 'pending':           return 'warn';
        case 'in-progress':       return 'info';
        case 'waiting-materials': return 'secondary';
        case 'delivered':         return 'success';
        case 'cancelled':         return 'danger';
        default:                  return 'contrast';
    }
};

/** Navigate to the new order creation page. */
const navigateToNew = () => {
    router.push({ name: 'orders-new' });
};

/**
 * Navigate to the order editing page.
 * @param {number} id - Order identifier.
 */
const navigateToEdit = (id) => {
    router.push({ name: 'orders-edit', params: { id } });
};

/**
 * Navigate to the order tracking page.
 * @param {number} id - Order identifier.
 */
const navigateToTracking = (id) => {
    router.push({ name: 'orders-tracking', params: { id } });
};

/**
 * Confirm and cancel a pending order.
 * @param {Object} order - Order entity to cancel.
 */
const confirmCancel = (order) => {
    confirm.require({
        message: t('orders.confirm-cancel', { project: order.projectName }),
        header: t('orders.cancel-header'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => cancelOrder(order)
    });
};

/**
 * Apply a carpenter review decision to a pending order.
 * @param {Object} order - Order entity under review.
 * @param {('accepted'|'rejected')} decision - Carpenter decision.
 */
const applyReview = (order, decision) => {
    reviewOrder(order, decision);
};
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('orders.title') }}</h1>
            <pv-button :label="t('orders.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <pv-data-table
            :value="orders"
            :loading="!ordersLoaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 60rem">
            <pv-column field="id"          :header="t('orders.id')"          sortable />
            <pv-column field="projectName" :header="t('orders.project')"     sortable />
            <pv-column field="clientName"  :header="t('orders.client')"      sortable />
            <pv-column field="woodType"    :header="t('orders.wood')" />
            <pv-column field="finish"      :header="t('orders.finish')" />
            <pv-column :header="t('orders.status')">
                <template #body="slotProps">
                    <pv-tag :value="t(`orders.status-${slotProps.data.status}`)" :severity="severityFor(slotProps.data.status)" />
                </template>
            </pv-column>
            <pv-column :header="t('orders.actions')">
                <template #body="slotProps">
                    <pv-button icon="pi pi-eye"    text rounded @click="navigateToTracking(slotProps.data.id)" />
                    <pv-button v-if="slotProps.data.status === 'pending'" icon="pi pi-pencil"      text rounded @click="navigateToEdit(slotProps.data.id)" />
                    <pv-button v-if="slotProps.data.status === 'pending'" icon="pi pi-check"       text rounded severity="success" @click="applyReview(slotProps.data, 'accepted')" />
                    <pv-button v-if="slotProps.data.status === 'pending'" icon="pi pi-times"       text rounded severity="danger"  @click="applyReview(slotProps.data, 'rejected')" />
                    <pv-button v-if="slotProps.data.status === 'pending'" icon="pi pi-ban"         text rounded severity="warn"    @click="confirmCancel(slotProps.data)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>

        <pv-confirm-dialog />
    </div>
</template>
