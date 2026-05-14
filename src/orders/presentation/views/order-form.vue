<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import { Order } from '../../domain/order.entity.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useOrdersStore();
const { errors } = toRefs(store);
const { fetchOrders, getOrderById, addOrder, updateOrder } = store;

const isEdit = computed(() => Boolean(route.params.id));

/**
 * Form model bound to the order being created or edited.
 * @type {import('vue').Ref<Order>}
 */
const order = ref(new Order({}));

onMounted(() => {
    if (!store.ordersLoaded) {
        fetchOrders();
    }
    if (isEdit.value) {
        const existing = getOrderById(route.params.id);
        if (existing) order.value = new Order({ ...existing });
    }
});

/** Submit the form to either create or update the order, then navigate back to the list. */
const submit = () => {
    if (isEdit.value) updateOrder(order.value);
    else              addOrder(order.value);
    router.push({ name: 'orders-list' });
};

/** Cancel the form and return to the list. */
const cancel = () => {
    router.push({ name: 'orders-list' });
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">
            {{ isEdit ? t('orders.edit-title') : t('orders.new-title') }}
        </h1>

        <form @submit.prevent="submit" style="max-width: 40rem">
            <div class="field mb-3">
                <label for="projectName" class="block mb-1 font-medium">{{ t('orders.project') }}</label>
                <pv-input-text id="projectName" v-model="order.projectName" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="clientName" class="block mb-1 font-medium">{{ t('orders.client') }}</label>
                <pv-input-text id="clientName" v-model="order.clientName" :disabled="isEdit" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="woodType" class="block mb-1 font-medium">{{ t('orders.wood') }}</label>
                <pv-input-text id="woodType" v-model="order.woodType" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="finish" class="block mb-1 font-medium">{{ t('orders.finish') }}</label>
                <pv-input-text id="finish" v-model="order.finish" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="description" class="block mb-1 font-medium">{{ t('orders.description') }}</label>
                <pv-textarea id="description" v-model="order.description" rows="4" class="w-full" />
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
