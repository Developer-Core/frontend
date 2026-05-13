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
const { ordersLoaded, errors } = toRefs(store);
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

        <div class="flex flex-column gap-3" style="max-width: 40rem">
            <pv-float-label>
                <pv-input-text id="projectName" v-model="order.projectName" class="w-full" />
                <label for="projectName">{{ t('orders.project') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-text id="clientName" v-model="order.clientName" class="w-full" :disabled="isEdit" />
                <label for="clientName">{{ t('orders.client') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-text id="woodType" v-model="order.woodType" class="w-full" />
                <label for="woodType">{{ t('orders.wood') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-input-text id="finish" v-model="order.finish" class="w-full" />
                <label for="finish">{{ t('orders.finish') }}</label>
            </pv-float-label>

            <pv-float-label>
                <pv-textarea id="description" v-model="order.description" rows="4" class="w-full" />
                <label for="description">{{ t('orders.description') }}</label>
            </pv-float-label>

            <div class="flex gap-2 justify-content-end">
                <pv-button :label="t('common.cancel')" severity="secondary" text @click="cancel" />
                <pv-button :label="t('common.save')"   icon="pi pi-check" @click="submit" />
            </div>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
