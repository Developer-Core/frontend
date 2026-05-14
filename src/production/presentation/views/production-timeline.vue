<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { computed, onMounted, toRefs } from 'vue';
import useProductionStore from '../../application/production.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();

const productionStore = useProductionStore();
const ordersStore     = useOrdersStore();

const { stages, stagesLoaded, errors } = toRefs(productionStore);
const { orders, ordersLoaded }         = toRefs(ordersStore);

const { fetchStages, changeStageStatus, deleteStage } = productionStore;
const { fetchOrders } = ordersStore;

onMounted(() => {
    if (!productionStore.stagesLoaded) fetchStages();
    if (!ordersStore.ordersLoaded)     fetchOrders();
});

/**
 * Orders that already have at least one stage defined, paired with their sorted stages.
 * @type {import('vue').ComputedRef<Array<{order: import('../../../orders/domain/order.entity.js').Order, stages: import('../../domain/stage.entity.js').Stage[]}>>}
 */
const timeline = computed(() => {
    return orders.value
        .map(order => ({
            order,
            stages: stages.value
                .filter(stage => stage.orderId === order.id)
                .sort((a, b) => a.sequence - b.sequence)
        }))
        .filter(group => group.stages.length > 0);
});

/**
 * Maps a stage status to a PrimeVue tag severity.
 * @param {string} status - Stage status value.
 * @returns {string} PrimeVue severity name.
 */
const severityFor = (status) => {
    switch (status) {
        case 'pending':     return 'warn';
        case 'in-progress': return 'info';
        case 'completed':   return 'success';
        default:            return 'contrast';
    }
};

/**
 * Navigate to the new stage form for a given order.
 * @param {number} orderId - Order identifier.
 */
const navigateToNewStage = (orderId) => {
    router.push({ name: 'production-stage-new', params: { orderId } });
};

/**
 * Navigate to the stage editing page.
 * @param {number} id - Stage identifier.
 */
const navigateToEditStage = (id) => {
    router.push({ name: 'production-stage-edit', params: { id } });
};

/**
 * Advance a stage to the next status in the lifecycle.
 * @param {Object} stage - Stage entity to advance.
 */
const advance = (stage) => {
    if      (stage.status === 'pending')     changeStageStatus(stage, 'in-progress');
    else if (stage.status === 'in-progress') changeStageStatus(stage, 'completed');
};

/**
 * Confirm and delete a stage.
 * @param {Object} stage - Stage entity to remove.
 */
const confirmDelete = (stage) => {
    confirm.require({
        message: t('production.confirm-delete', { name: stage.name }),
        header:  t('production.delete-header'),
        icon:    'pi pi-exclamation-triangle',
        accept:  () => deleteStage(stage)
    });
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">{{ t('production.title') }}</h1>

        <div v-if="!stagesLoaded || !ordersLoaded" class="text-color-secondary">
            {{ t('production.loading') }}
        </div>

        <div v-else-if="timeline.length === 0" class="text-color-secondary">
            {{ t('production.empty') }}
        </div>

        <div v-else class="flex flex-column gap-3">
            <pv-card v-for="group in timeline" :key="group.order.id">
                <template #title>
                    <div class="flex justify-content-between align-items-center">
                        <span>{{ group.order.projectName }}</span>
                        <pv-button
                            :label="t('production.new-stage')"
                            icon="pi pi-plus"
                            size="small"
                            @click="navigateToNewStage(group.order.id)" />
                    </div>
                </template>
                <template #content>
                    <pv-data-table :value="group.stages" striped-rows>
                        <pv-column field="sequence"       :header="t('production.sequence')" />
                        <pv-column field="name"           :header="t('production.name')" />
                        <pv-column field="estimatedHours" :header="t('production.estimated-hours')" />
                        <pv-column field="actualHours"    :header="t('production.actual-hours')" />
                        <pv-column :header="t('production.status')">
                            <template #body="slotProps">
                                <pv-tag :value="t(`production.status-${slotProps.data.status}`)" :severity="severityFor(slotProps.data.status)" />
                            </template>
                        </pv-column>
                        <pv-column :header="t('production.actions')">
                            <template #body="slotProps">
                                <pv-button
                                    v-if="slotProps.data.status !== 'completed'"
                                    icon="pi pi-forward"
                                    text rounded
                                    :aria-label="t('production.actions-advance')"
                                    v-tooltip.top="t('production.actions-advance')"
                                    @click="advance(slotProps.data)" />
                                <pv-button
                                    icon="pi pi-pencil"
                                    text rounded
                                    :aria-label="t('production.actions-edit')"
                                    v-tooltip.top="t('production.actions-edit')"
                                    @click="navigateToEditStage(slotProps.data.id)" />
                                <pv-button
                                    icon="pi pi-trash"
                                    text rounded severity="danger"
                                    :aria-label="t('production.actions-delete')"
                                    v-tooltip.top="t('production.actions-delete')"
                                    @click="confirmDelete(slotProps.data)" />
                            </template>
                        </pv-column>
                    </pv-data-table>
                </template>
            </pv-card>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>

        <pv-confirm-dialog />
    </div>
</template>
