<script setup>
import { useI18n } from 'vue-i18n';
import { computed, onMounted, reactive, ref } from 'vue';
import useOrdersStore from '../../../orders/application/orders.store.js';
import useProductionStore from '../../application/production.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { OrderStatus } from '../../../orders/domain/order-status.js';
import { StageStatus, stageStatusKey, stageStatusSeverity } from '../../domain/stage-status.js';

const { t }        = useI18n();
const ordersStore  = useOrdersStore();
const production   = useProductionStore();
const iamStore     = useIamStore();

const isCarpenter = computed(() => iamStore.currentRole === 'Carpenter');

/** Normalizes a quote status for case-insensitive comparison. */
const normalizeQuoteStatus = (s) => String(s ?? '').trim().toLowerCase();
/** Whether an order's quote has been accepted. */
const quoteAccepted = (o) => normalizeQuoteStatus(o.quote?.status) === 'accepted';

/**
 * Orders that are actively in the production pipeline: an accepted order only
 * enters once its quote is accepted, plus everything already in production.
 */
const productionOrders = computed(() => ordersStore.orders.filter(o =>
    (o.status === OrderStatus.ACCEPTED && quoteAccepted(o))
    || o.status === OrderStatus.IN_PROGRESS
    || o.status === OrderStatus.READY_FOR_DELIVERY));

/** i18n key for the production phase label of an order status. */
const productionPhaseKey = (status) => {
    switch (status) {
        case OrderStatus.ACCEPTED:           return 'production.phase-to-plan';
        case OrderStatus.IN_PROGRESS:        return 'production.phase-in-production';
        case OrderStatus.READY_FOR_DELIVERY: return 'production.phase-ready';
        default:                             return 'production.phase-to-plan';
    }
};

/** PrimeVue Tag severity for the production phase of an order status. */
const productionPhaseSeverity = (status) => {
    switch (status) {
        case OrderStatus.ACCEPTED:           return 'warn';
        case OrderStatus.IN_PROGRESS:        return 'info';
        case OrderStatus.READY_FOR_DELIVERY: return 'success';
        default:                             return 'info';
    }
};

const selectedOrder = ref(null);

/** Draft plan used when no stages exist yet. */
const plan = reactive({ rows: [{ name: '', estimatedTimeInDays: 1 }] });

onMounted(() => {
    if (!ordersStore.ordersLoaded) ordersStore.fetchOrders();
});

/** Selects an order and loads its stages. */
function selectOrder(order) {
    selectedOrder.value = order;
    plan.rows = [{ name: '', estimatedTimeInDays: 1 }];
    production.fetchStages(order.id);
}

const addRow    = () => plan.rows.push({ name: '', estimatedTimeInDays: 1 });
const removeRow = (i) => plan.rows.splice(i, 1);

const planValid = computed(() => plan.rows.length > 0 && plan.rows.every(r => r.name && r.estimatedTimeInDays > 0));

/** Submits the stage plan for the selected order. */
function submitPlan() {
    if (!planValid.value || !selectedOrder.value) return;
    production.defineStages(selectedOrder.value.id,
        plan.rows.map(r => ({ name: r.name, estimatedTimeInDays: Number(r.estimatedTimeInDays) })));
}

/** Advances a stage to the next status (Pending -> InProgress -> Completed). */
function advance(stage) {
    const next = stage.status === StageStatus.PENDING ? StageStatus.IN_PROGRESS
        : stage.status === StageStatus.IN_PROGRESS ? StageStatus.COMPLETED : null;
    if (!next || !selectedOrder.value) return;
    production.updateStageStatus(selectedOrder.value.id, stage.id, next);
}

const canAdvance = (stage) => stage.status !== StageStatus.COMPLETED;

/** Re-reads the selected order from the store so its phase and controls refresh. */
function refreshSelectedOrder() {
    if (!selectedOrder.value) return;
    const fresh = ordersStore.orders.find(o => o.id === selectedOrder.value.id);
    if (fresh) selectedOrder.value = fresh;
}

/** Whether "Iniciar producción" can be shown: accepted order with stages already defined. */
const canStartProduction = computed(() =>
    selectedOrder.value?.status === OrderStatus.ACCEPTED && production.stages.length > 0);
const canMarkReady = computed(() => selectedOrder.value?.status === OrderStatus.IN_PROGRESS);
const canComplete  = computed(() => selectedOrder.value?.status === OrderStatus.READY_FOR_DELIVERY);

/** Starts production of the selected order, then refreshes its phase/controls. */
async function startProduction() {
    if (!selectedOrder.value) return;
    await ordersStore.startProduction(selectedOrder.value.id);
    refreshSelectedOrder();
}

/** Marks the selected order ready for delivery, then refreshes its phase/controls. */
async function markReady() {
    if (!selectedOrder.value) return;
    await ordersStore.markReady(selectedOrder.value.id);
    refreshSelectedOrder();
}

/** Completes/delivers the selected order, then refreshes its phase/controls. */
async function completeOrder() {
    if (!selectedOrder.value) return;
    await ordersStore.completeOrder(selectedOrder.value.id);
    refreshSelectedOrder();
}

const progressStyle = computed(() => ({ width: `${production.completedPercent}%` }));
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">{{ t('production.title') }}</h1>

        <div class="grid">
            <!-- Orders in production -->
            <div class="col-12 md:col-4">
                <pv-card>
                    <template #title>{{ t('production.orders-title') }}</template>
                    <template #content>
                        <div v-if="!productionOrders.length" class="text-color-secondary">
                            {{ t('production.no-orders') }}
                        </div>
                        <div v-else class="flex flex-column gap-2">
                            <button
                                v-for="order in productionOrders"
                                :key="order.id"
                                type="button"
                                class="production-order-item flex justify-content-between align-items-center gap-3 p-3 border-round border-none cursor-pointer text-left w-full"
                                :class="{ 'production-order-item--active': selectedOrder?.id === order.id }"
                                @click="selectOrder(order)">
                                <span class="production-order-item__content">
                                    <strong>#{{ order.id }}</strong>
                                    <span class="text-color-secondary ml-2">{{ order.details.furnitureType }}</span>
                                </span>
                                <pv-tag :value="t(productionPhaseKey(order.status))" :severity="productionPhaseSeverity(order.status)" />
                            </button>
                        </div>
                    </template>
                </pv-card>
            </div>

            <!-- Stages of the selected order -->
            <div class="col-12 md:col-8">
                <pv-card>
                    <template #title>
                        {{ selectedOrder ? t('production.stages-of', { id: selectedOrder.id }) : t('production.select-order') }}
                    </template>
                    <template #content>
                        <div
                            v-if="selectedOrder && isCarpenter && (canStartProduction || canMarkReady || canComplete)"
                            class="flex flex-wrap justify-content-end gap-2 mb-3">
                            <pv-button v-if="canStartProduction" size="small" icon="pi pi-play"
                                       :label="t('orders.actions-start')" @click="startProduction" />
                            <pv-button v-if="canMarkReady" size="small" icon="pi pi-check" severity="success"
                                       :label="t('orders.actions-ready')" @click="markReady" />
                            <pv-button v-if="canComplete" size="small" icon="pi pi-flag-fill" severity="success"
                                       :label="t('orders.actions-complete')" @click="completeOrder" />
                        </div>

                        <div v-if="!selectedOrder" class="text-color-secondary">{{ t('production.select-order-hint') }}</div>

                        <!-- Existing stages timeline -->
                        <div v-else-if="production.stages.length" class="flex flex-column gap-2">
                            <div class="flex justify-content-between align-items-center mb-2">
                                <strong>{{ t('production.progress') }}</strong>
                                <span class="font-medium">{{ production.completedPercent }}%</span>
                            </div>
                            <div class="production-progress border-round overflow-hidden mb-3">
                                <div class="production-progress__fill" :style="progressStyle" />
                            </div>
                            <div
                                v-for="stage in production.stages"
                                :key="stage.id"
                                class="production-stage-item flex justify-content-between align-items-center gap-3 p-3 border-round">
                                <div class="production-stage-item__content">
                                    <span class="font-medium">{{ stage.orderIndex + 1 }}. {{ stage.name }}</span>
                                    <small class="text-color-secondary ml-2">{{ stage.estimatedTimeInDays }} {{ t('production.days') }}</small>
                                </div>
                                <div class="production-stage-item__actions flex align-items-center gap-2">
                                    <pv-tag :value="t(stageStatusKey(stage.status))" :severity="stageStatusSeverity(stage.status)" />
                                    <pv-button v-if="canAdvance(stage)" size="small" icon="pi pi-arrow-right"
                                               v-tooltip.top="t('production.advance')" :aria-label="t('production.advance')"
                                               @click="advance(stage)" />
                                </div>
                            </div>
                        </div>

                        <!-- Define plan (no stages yet) -->
                        <form v-else class="flex flex-column gap-3" @submit.prevent="submitPlan">
                            <p class="text-color-secondary m-0 mb-1">{{ t('production.no-stages') }}</p>
                            <div
                                v-for="(row, i) in plan.rows"
                                :key="i"
                                class="formgrid grid align-items-start production-plan-row">
                                <div class="field col-12 lg:col-8 production-plan-row__field">
                                    <pv-input-text
                                        v-model="row.name"
                                        class="w-full"
                                        :placeholder="t('production.stage-name')" />
                                </div>
                                <div class="field col-8 sm:col-4 lg:col-3 production-plan-row__field">
                                    <pv-input-number
                                        v-model="row.estimatedTimeInDays"
                                        :min="1"
                                        input-class="w-full"
                                        class="w-full"
                                        :placeholder="t('production.days')" />
                                </div>
                                <div class="field col-4 sm:col-2 lg:col-1 flex justify-content-end lg:justify-content-center">
                                    <pv-button type="button" icon="pi pi-trash" text rounded severity="danger"
                                               :disabled="plan.rows.length === 1" @click="removeRow(i)" />
                                </div>
                            </div>
                            <div class="flex flex-column-reverse sm:flex-row justify-content-between align-items-stretch sm:align-items-center gap-2 mt-1">
                                <pv-button type="button" size="small" text icon="pi pi-plus"
                                           :label="t('production.add-stage')" @click="addRow" />
                                <pv-button type="submit" size="small" icon="pi pi-check"
                                           :label="t('production.define-stages')" :disabled="!planValid" />
                            </div>
                        </form>

                        <div v-if="production.errors.length" class="text-red-500 mt-3">
                            {{ t('errors.occurred') }}: {{ production.errors.map(e => e.message).join(', ') }}
                        </div>
                    </template>
                </pv-card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.production-order-item,
.production-stage-item,
.production-plan-row__field {
    min-width: 0;
}

.production-order-item {
    background: var(--p-surface-100);
}

.production-order-item--active {
    background: var(--p-primary-50);
}

.production-order-item__content,
.production-stage-item__content {
    min-width: 0;
    flex: 1;
}

.production-progress {
    height: 0.5rem;
    background: var(--p-surface-200);
}

.production-progress__fill {
    height: 100%;
    background: var(--p-primary-color);
    transition: width 0.3s ease;
}

.production-stage-item {
    background: var(--p-surface-100);
}

.production-stage-item__actions {
    flex-shrink: 0;
}

.production-plan-row__field :deep(.p-inputnumber),
.production-plan-row__field :deep(.p-inputnumber-input) {
    width: 100%;
    min-width: 0;
}

@media (max-width: 768px) {
    .production-order-item,
    .production-stage-item {
        align-items: flex-start;
        flex-direction: column;
    }

    .production-stage-item__actions {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
