<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed, onMounted, toRefs } from 'vue';
import useOrdersStore from '../../../orders/application/orders.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { orderStatusKey, orderStatusSeverity } from '../../../orders/domain/order-status.js';

const { t }   = useI18n();
const router  = useRouter();
const ordersStore = useOrdersStore();
const iamStore    = useIamStore();
const { orders, ordersLoaded, errors } = toRefs(ordersStore);

onMounted(() => {
    if (!ordersStore.ordersLoaded) ordersStore.fetchOrders();
    iamStore.fetchUsers();
    iamStore.fetchProfiles();
});

const counterpartLabel = computed(() =>
    (iamStore.currentRole === 'Carpenter' ? t('communication.sender-client') : t('communication.sender-workshop')));

const orderTitle = (order) => order.details?.furnitureType || t('communication.order-label', { id: order.id });

const orderSubtitle = (order) => {
    const counterpartId = iamStore.currentRole === 'Carpenter' ? order.customerId : order.carpenterId;
    const counterpartName = iamStore.displayNameById(counterpartId);
    const orderLabel = t('communication.order-label', { id: order.id });
    return counterpartName
        ? `${counterpartLabel.value}: ${counterpartName} · ${orderLabel}`
        : orderLabel;
};

/** Opens the message thread for an order. */
const openThread = (orderId) => router.push({ name: 'communication-thread', params: { id: orderId } });
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">{{ t('communication.title') }}</h1>

        <div v-if="!ordersLoaded" class="text-color-secondary">{{ t('communication.loading') }}</div>
        <div v-else-if="!orders.length" class="text-color-secondary">{{ t('communication.empty') }}</div>

        <div v-else class="flex flex-column gap-2">
            <button
                v-for="order in orders"
                :key="order.id"
                type="button"
                class="flex justify-content-between align-items-center gap-3 p-3 border-round border-none cursor-pointer text-left w-full surface-card"
                style="border: 1px solid var(--p-surface-200);"
                @click="openThread(order.id)">
                <div class="flex align-items-center gap-3 min-w-0">
                    <i class="pi pi-comments text-xl text-color-secondary" />
                    <div class="min-w-0">
                        <div class="font-semibold">{{ orderTitle(order) }}</div>
                        <small class="text-color-secondary">{{ orderSubtitle(order) }}</small>
                    </div>
                </div>
                <pv-tag :value="t(orderStatusKey(order.status))" :severity="orderStatusSeverity(order.status)" />
            </button>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
