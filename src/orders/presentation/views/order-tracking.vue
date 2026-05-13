<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useOrdersStore();
const { ordersLoaded, errors } = toRefs(store);
const { fetchOrders, getOrderById } = store;

/**
 * Order entity currently being tracked.
 * @type {import('vue').ComputedRef<import('../../domain/order.entity.js').Order|undefined>}
 */
const order = computed(() => getOrderById(route.params.id));

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

/** Navigate back to the orders list. */
const back = () => {
    router.push({ name: 'orders-list' });
};
</script>

<template>
    <div class="p-4">
        <div class="flex align-items-center gap-2 mb-3">
            <pv-button icon="pi pi-arrow-left" text rounded @click="back" />
            <h1 class="text-2xl font-semibold">{{ t('orders.tracking-title') }}</h1>
        </div>

        <pv-card v-if="order">
            <template #title>
                <div class="flex justify-content-between align-items-center">
                    <span>{{ order.projectName }}</span>
                    <pv-tag :value="t(`orders.status-${order.status}`)" :severity="severityFor(order.status)" />
                </div>
            </template>
            <template #content>
                <div class="grid">
                    <div class="col-12 md:col-6">
                        <p><strong>{{ t('orders.client') }}:</strong> {{ order.clientName }}</p>
                        <p><strong>{{ t('orders.wood') }}:</strong>   {{ order.woodType }}</p>
                        <p><strong>{{ t('orders.finish') }}:</strong> {{ order.finish }}</p>
                    </div>
                    <div class="col-12 md:col-6">
                        <p><strong>{{ t('orders.start-date') }}:</strong> {{ order.startDate ?? '—' }}</p>
                        <p><strong>{{ t('orders.end-date') }}:</strong>   {{ order.endDate   ?? '—' }}</p>
                    </div>
                    <div class="col-12 mt-3">
                        <p><strong>{{ t('orders.description') }}:</strong></p>
                        <p>{{ order.description }}</p>
                    </div>
                </div>
            </template>
        </pv-card>

        <div v-else-if="ordersLoaded" class="text-color-secondary">
            {{ t('orders.not-found') }}
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
