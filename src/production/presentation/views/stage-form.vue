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

const { errors }       = toRefs(productionStore);
const { orders }       = toRefs(ordersStore);

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

        <div class="flex flex-column gap-3" style="max-width: 40rem">
            <pv-float-label>
                <pv-select
                    id="orderId"
                    v-model="stage.orderId"
                    :options="orders"
                    option-label="projectName"
                    option-value="id"
                    :disabled="isEdit"
                    class="w-full" />
                <label for="orderId">{{ t('production.order') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-text id="name" v-model="stage.name" class="w-full" />
                <label for="name">{{ t('production.name') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-number id="sequence" v-model="stage.sequence" :min="1" class="w-full" />
                <label for="sequence">{{ t('production.sequence') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-number id="estimatedHours" v-model="stage.estimatedHours" :min="0" :max-fraction-digits="2" class="w-full" />
                <label for="estimatedHours">{{ t('production.estimated-hours') }}</label>
            </pv-float-label>

            <pv-float-label v-if="isEdit">
                <pv-input-number id="actualHours" v-model="stage.actualHours" :min="0" :max-fraction-digits="2" class="w-full" />
                <label for="actualHours">{{ t('production.actual-hours') }}</label>
            </pv-float-label>

            <div class="flex gap-2 justify-content-end">
                <pv-button :label="t('common.cancel')" severity="secondary" text @click="cancel" />
                <pv-button :label="t('common.save')"   icon="pi pi-check"   @click="submit" />
            </div>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
