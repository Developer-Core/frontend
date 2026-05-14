<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, toRefs } from 'vue';
import useProductionStore from '../../application/production.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';
import { Stage } from '../../domain/stage.entity.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const productionStore = useProductionStore();
const ordersStore     = useOrdersStore();

const { errors } = toRefs(productionStore);
const { orders } = toRefs(ordersStore);

const { fetchStages, getStageById, addStage, updateStage } = productionStore;
const { fetchOrders } = ordersStore;

const isEdit = computed(() => Boolean(route.params.id));

/**
 * Form model bound to the stage being created or edited.
 * @type {import('vue').Ref<Stage>}
 */
const stage = ref(new Stage({ orderId: route.params.orderId ? parseInt(route.params.orderId) : null }));

onMounted(() => {
    if (!productionStore.stagesLoaded) fetchStages();
    if (!ordersStore.ordersLoaded)     fetchOrders();
    if (isEdit.value) {
        const existing = getStageById(route.params.id);
        if (existing) stage.value = new Stage({ ...existing });
    }
});

/** Submit the form to either create or update the stage, then navigate back to the timeline. */
const submit = () => {
    if (isEdit.value) updateStage(stage.value);
    else              addStage(stage.value);
    router.push({ name: 'production-timeline' });
};

/** Cancel the form and return to the timeline. */
const cancel = () => {
    router.push({ name: 'production-timeline' });
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">
            {{ isEdit ? t('production.edit-stage') : t('production.new-stage-title') }}
        </h1>

        <form @submit.prevent="submit" style="max-width: 40rem">
            <div class="field mb-3">
                <label for="orderId" class="block mb-1 font-medium">{{ t('production.order') }}</label>
                <pv-select
                    id="orderId"
                    v-model="stage.orderId"
                    :options="orders"
                    option-label="projectName"
                    option-value="id"
                    :disabled="isEdit"
                    :placeholder="t('production.select-order')"
                    class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="name" class="block mb-1 font-medium">{{ t('production.name') }}</label>
                <pv-input-text id="name" v-model="stage.name" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="sequence" class="block mb-1 font-medium">{{ t('production.sequence') }}</label>
                <pv-input-number id="sequence" v-model="stage.sequence" :min="1" class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="estimatedHours" class="block mb-1 font-medium">{{ t('production.estimated-hours') }}</label>
                <pv-input-number id="estimatedHours" v-model="stage.estimatedHours" :min="0" :max-fraction-digits="2" class="w-full" />
            </div>

            <div v-if="isEdit" class="field mb-3">
                <label for="actualHours" class="block mb-1 font-medium">{{ t('production.actual-hours') }}</label>
                <pv-input-number id="actualHours" v-model="stage.actualHours" :min="0" :max-fraction-digits="2" class="w-full" />
            </div>

            <div class="flex gap-2 justify-content-end mt-4">
                <pv-button type="button" :label="t('common.cancel')" severity="secondary" text @click="cancel" />
                <pv-button type="submit" :label="t('common.save')"   icon="pi pi-check" />
            </div>
        </form>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
