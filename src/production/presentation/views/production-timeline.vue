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

/** Whether the plan form is shown to edit already-defined (but not started) stages. */
const editing = ref(false);

/** Draft plan used when no stages exist yet, or when editing the current plan. */
const plan = reactive({ rows: [{ name: '', estimatedTimeInDays: 1 }] });

onMounted(() => {
    if (!ordersStore.ordersLoaded) ordersStore.fetchOrders();
});

/** Selects an order and loads its stages. */
function selectOrder(order) {
    selectedOrder.value = order;
    editing.value = false;
    plan.rows = [{ name: '', estimatedTimeInDays: 1 }];
    production.fetchStages(order.id);
}

const addRow    = () => plan.rows.push({ name: '', estimatedTimeInDays: 1 });
const removeRow = (i) => plan.rows.splice(i, 1);

const planValid = computed(() => plan.rows.length > 0 && plan.rows.every(r => r.name && r.estimatedTimeInDays > 0));

/**
 * Whether the selected order's already-defined stages can still be edited: none of
 * them has started and the order has not yet entered production.
 */
const canEditStages = computed(() =>
    selectedOrder.value?.status === OrderStatus.ACCEPTED
    && production.stages.length > 0
    && production.stages.every(s => s.status === StageStatus.PENDING));

/** Opens the plan form preloaded with the current stages, in edit mode. */
function startEditing() {
    plan.rows = production.stages.map(s => ({ name: s.name, estimatedTimeInDays: s.estimatedTimeInDays }));
    editing.value = true;
}

/** Leaves edit mode without saving. */
function cancelEditing() {
    editing.value = false;
}

/** Submits the stage plan for the selected order (define, or redefine when editing). */
async function submitPlan() {
    if (!planValid.value || !selectedOrder.value) return;
    const stageList = plan.rows.map(r => ({ name: r.name, estimatedTimeInDays: Number(r.estimatedTimeInDays) }));
    if (editing.value) {
        const result = await production.updateStages(selectedOrder.value.id, stageList);
        if (result) {
            editing.value = false;
            production.fetchStages(selectedOrder.value.id);
        }
        return;
    }
    production.defineStages(selectedOrder.value.id, stageList);
}

/** Advances a stage to the next status (Pending -> InProgress -> Completed). */
async function advance(stage) {
    const next = stage.status === StageStatus.PENDING ? StageStatus.IN_PROGRESS
        : stage.status === StageStatus.IN_PROGRESS ? StageStatus.COMPLETED : null;
    if (!next || !selectedOrder.value) return;
    await production.updateStageStatus(selectedOrder.value.id, stage.id, next);
    // Stage progress lives on the order (completedStages/totalStages), so refresh the
    // orders store to keep the orders list progress column in sync without a reload.
    await ordersStore.fetchOrders();
    refreshSelectedOrder();
}

// Stages can only be advanced once production has started (order is in progress).
const canAdvance = (stage) =>
    selectedOrder.value?.status === OrderStatus.IN_PROGRESS && stage.status !== StageStatus.COMPLETED;

/** Re-reads the selected order from the store so its phase and controls refresh. */
function refreshSelectedOrder() {
    if (!selectedOrder.value) return;
    const fresh = ordersStore.orders.find(o => o.id === selectedOrder.value.id);
    if (fresh) selectedOrder.value = fresh;
}

/** Whether "Iniciar producción" can be shown: accepted order with stages already defined. */
const canStartProduction = computed(() =>
    !editing.value && selectedOrder.value?.status === OrderStatus.ACCEPTED && production.stages.length > 0);
const canMarkReady = computed(() => selectedOrder.value?.status === OrderStatus.IN_PROGRESS);
/** The order is closed only once fully paid: confirmed payments must cover the quote total. */
const isFullyPaid = computed(() => {
    const order = selectedOrder.value;
    const total = Number(order?.quote?.total ?? 0);
    if (!total) return false;
    const paid = (order?.payments ?? [])
        .filter(payment => payment.status === 'Confirmed')
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return paid >= total;
});
// The furniture can be ready, but the order closes only when it is fully paid.
const canComplete       = computed(() => selectedOrder.value?.status === OrderStatus.READY_FOR_DELIVERY && isFullyPaid.value);
const awaitingFinalPayment = computed(() =>
    selectedOrder.value?.status === OrderStatus.READY_FOR_DELIVERY && !isFullyPaid.value);

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
                            v-if="selectedOrder && isCarpenter && (canStartProduction || canMarkReady || canComplete || awaitingFinalPayment)"
                            class="flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
                            <small v-if="awaitingFinalPayment" class="text-color-secondary mr-auto">
                                {{ t('production.awaiting-final-payment') }}
                            </small>
                            <pv-button v-if="canStartProduction" size="small" icon="pi pi-play"
                                       :label="t('orders.actions-start')" @click="startProduction" />
                            <pv-button v-if="canMarkReady" size="small" icon="pi pi-check" severity="success"
                                       :label="t('orders.actions-ready')" @click="markReady" />
                            <pv-button v-if="canComplete" size="small" icon="pi pi-flag-fill" severity="success"
                                       :label="t('orders.actions-complete')" @click="completeOrder" />
                        </div>

                        <div v-if="!selectedOrder" class="text-color-secondary">{{ t('production.select-order-hint') }}</div>

                        <!-- Existing stages timeline -->
                        <div v-else-if="production.stages.length && !editing" class="flex flex-column gap-2">
                            <div class="flex justify-content-between align-items-center mb-2">
                                <div class="flex align-items-center gap-2">
                                    <strong>{{ t('production.progress') }}</strong>
                                    <pv-button v-if="canEditStages" size="small" text icon="pi pi-pencil"
                                               :label="t('production.edit-stages')" @click="startEditing" />
                                </div>
                                <span class="font-medium">{{ production.completedPercent }}%</span>
                            </div>
                            <div class="production-progress border-round overflow-hidden mb-3">
                                <div class="production-progress__fill" :style="progressStyle" />
                            </div>
                            <small v-if="selectedOrder?.status === OrderStatus.ACCEPTED" class="text-color-secondary mb-2">
                                {{ t('production.start-to-advance') }}
                            </small>
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

                        <!-- Define plan (no stages yet) or edit the existing plan -->
                        <form v-else class="flex flex-column gap-3" @submit.prevent="submitPlan">
                            <p class="text-color-secondary m-0 mb-1">{{ editing ? t('production.edit-stages-hint') : t('production.no-stages') }}</p>
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
                                <div class="flex flex-column-reverse sm:flex-row gap-2">
                                    <pv-button v-if="editing" type="button" size="small" text severity="secondary"
                                               :label="t('common.cancel')" @click="cancelEditing" />
                                    <pv-button type="submit" size="small" icon="pi pi-check"
                                               :label="editing ? t('production.save-stages') : t('production.define-stages')"
                                               :disabled="!planValid" />
                                </div>
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
