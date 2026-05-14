<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { computed, onMounted, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import useProductionStore from '../../../production/application/production.store.js';

const { t } = useI18n();
const route = useRoute();

const ordersStore     = useOrdersStore();
const productionStore = useProductionStore();

const { ordersLoaded } = toRefs(ordersStore);
const { stagesLoaded } = toRefs(productionStore);

const { fetchOrders, getOrderById } = ordersStore;
const { fetchStages, getStagesByOrderId } = productionStore;

onMounted(() => {
    if (!ordersStore.ordersLoaded)     fetchOrders();
    if (!productionStore.stagesLoaded) fetchStages();
});

/**
 * Order entity being publicly tracked.
 * @type {import('vue').ComputedRef<import('../../domain/order.entity.js').Order|undefined>}
 */
const order = computed(() => getOrderById(route.params.id));

/**
 * Stages associated with the tracked order, sorted by sequence.
 * @type {import('vue').ComputedRef<import('../../../production/domain/stage.entity.js').Stage[]>}
 */
const stages = computed(() => order.value ? getStagesByOrderId(order.value.id) : []);

/**
 * Maps an order status to a PrimeVue tag severity.
 * @param {string} status - Order status value.
 * @returns {string} PrimeVue severity name.
 */
const orderSeverityFor = (status) => {
    switch (status) {
        case 'pending':           return 'warn';
        case 'in-progress':       return 'info';
        case 'waiting-materials': return 'secondary';
        case 'delivered':         return 'success';
        case 'cancelled':         return 'danger';
        default:                  return 'contrast';
    }
};

/**
 * Maps a stage status to a PrimeVue tag severity.
 * @param {string} status - Stage status value.
 * @returns {string} PrimeVue severity name.
 */
const stageSeverityFor = (status) => {
    switch (status) {
        case 'pending':     return 'warn';
        case 'in-progress': return 'info';
        case 'completed':   return 'success';
        default:            return 'contrast';
    }
};

/**
 * Percentage of completed stages over the total number of stages.
 * @type {import('vue').ComputedRef<number>}
 */
const completedPercent = computed(() => {
    if (stages.value.length === 0) return 0;
    const completed = stages.value.filter(s => s.status === 'completed').length;
    return Math.round((completed / stages.value.length) * 100);
});
</script>

<template>
    <div class="flex flex-column align-items-center p-4" style="min-height: 100vh; background: var(--p-surface-50);">
        <div style="max-width: 48rem; width: 100%;">
            <header class="mb-4">
                <h1 class="text-xl font-semibold m-0">{{ t('public-tracking.brand') }}</h1>
                <p class="text-color-secondary m-0">{{ t('public-tracking.subtitle') }}</p>
            </header>

            <div v-if="!ordersLoaded || !stagesLoaded" class="text-color-secondary">
                {{ t('public-tracking.loading') }}
            </div>

            <pv-card v-else-if="order">
                <template #title>
                    <div class="flex justify-content-between align-items-center">
                        <span>{{ order.projectName }}</span>
                        <pv-tag :value="t(`orders.status-${order.status}`)" :severity="orderSeverityFor(order.status)" />
                    </div>
                </template>
                <template #subtitle>
                    {{ t('public-tracking.order-id', { id: order.id }) }} · {{ order.clientName }}
                </template>
                <template #content>
                    <div class="grid mb-4">
                        <div class="col-12 md:col-6">
                            <p><strong>{{ t('orders.wood') }}:</strong> {{ order.woodType }}</p>
                            <p><strong>{{ t('orders.finish') }}:</strong> {{ order.finish }}</p>
                        </div>
                        <div class="col-12 md:col-6">
                            <p><strong>{{ t('orders.start-date') }}:</strong> {{ order.startDate ?? '—' }}</p>
                            <p><strong>{{ t('orders.end-date') }}:</strong> {{ order.endDate ?? '—' }}</p>
                        </div>
                    </div>

                    <div v-if="stages.length" class="mb-3">
                        <div class="flex justify-content-between align-items-center mb-2">
                            <strong>{{ t('public-tracking.progress') }}</strong>
                            <span class="font-medium">{{ completedPercent }}%</span>
                        </div>
                        <div class="border-round overflow-hidden" style="height: 0.5rem; background: var(--p-surface-200);">
                            <div :style="{ width: `${completedPercent}%`, height: '100%', background: 'var(--p-primary-color)' }"></div>
                        </div>
                    </div>

                    <div v-if="stages.length" class="flex flex-column gap-2">
                        <div v-for="stage in stages" :key="stage.id"
                             class="flex justify-content-between align-items-center p-3 border-round"
                             style="background: var(--p-surface-100);">
                            <div>
                                <span class="font-medium">{{ stage.sequence }}. {{ stage.name }}</span>
                            </div>
                            <pv-tag :value="t(`production.status-${stage.status}`)" :severity="stageSeverityFor(stage.status)" />
                        </div>
                    </div>

                    <div v-else class="text-color-secondary">
                        {{ t('public-tracking.no-stages') }}
                    </div>
                </template>
            </pv-card>

            <div v-else class="text-color-secondary">
                {{ t('public-tracking.not-found') }}
            </div>

            <footer class="text-center text-color-secondary mt-4">
                <small>{{ t('public-tracking.footer') }}</small>
            </footer>
        </div>
    </div>
</template>
