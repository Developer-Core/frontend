<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { computed, onMounted, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import { OrderStatus, orderStatusKey, orderStatusSeverity } from '../../domain/order-status.js';

const { t }   = useI18n();
const router  = useRouter();
const confirm = useConfirm();
const store   = useOrdersStore();
const iamStore = useIamStore();
const { orders, ordersLoaded, errors } = toRefs(store);
const { fetchOrders, acceptOrder, rejectOrder, cancelOrder } = store;

onMounted(() => {
    if (!store.ordersLoaded) fetchOrders();
    iamStore.fetchUsers();
    iamStore.fetchProfiles();
});

const profileByEmail = computed(() => {
    const entries = iamStore.profiles.map(profile => [profile.email, profile]);
    return new Map(entries);
});

const userById = computed(() => {
    const entries = iamStore.users.map(user => [user.id, user]);
    return new Map(entries);
});

const resolveUserName = (userId) => {
    const user = userById.value.get(userId);
    if (!user) return userId;
    const profile = profileByEmail.value.get(user.email);
    return profile?.fullName || user.email || userId;
};

const normalizeQuoteStatus = (status) => String(status ?? '').trim().toLowerCase();

const quoteSeverity = (status) => {
    switch (normalizeQuoteStatus(status)) {
        case 'draft': return 'secondary';
        case 'sent': return 'info';
        case 'accepted': return 'success';
        case 'rejected': return 'danger';
        default: return 'contrast';
    }
};

const isPending = (order) => order.status === OrderStatus.PENDING;

const navigateToNew      = () => router.push({ name: 'orders-new' });
const navigateToEdit     = (id) => router.push({ name: 'orders-edit', params: { id } });
const navigateToTracking = (id) => router.push({ name: 'orders-tracking', params: { id } });

const requireConfirmation = ({ message, header, acceptLabel, acceptClass, accept }) => {
    confirm.require({
        message,
        header,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel,
        rejectLabel: t('common.cancel'),
        acceptClass,
        rejectClass: 'p-button-outlined p-button-secondary',
        accept
    });
};

const confirmAccept = (order) => {
    requireConfirmation({
        message: t('orders.confirm-accept', { id: order.id }),
        header: t('orders.accept-header'),
        acceptLabel: t('orders.actions-accept'),
        acceptClass: 'p-button-primary',
        accept: () => acceptOrder(order.id)
    });
};

const confirmReject = (order) => {
    requireConfirmation({
        message: t('orders.confirm-reject', { id: order.id }),
        header: t('orders.reject-header'),
        acceptLabel: t('orders.actions-reject'),
        acceptClass: 'p-button-danger',
        accept: () => rejectOrder(order.id)
    });
};

/**
 * Confirms and cancels an order.
 * @param {import('../../domain/order.entity.js').Order} order - Order to cancel.
 */
const confirmCancel = (order) => {
    requireConfirmation({
        message: t('orders.confirm-cancel', { id: order.id }),
        header: t('orders.cancel-header'),
        acceptLabel: t('orders.actions-cancel'),
        acceptClass: 'p-button-danger',
        accept: () => cancelOrder(order.id)
    });
};
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('orders.title') }}</h1>
            <pv-button :label="t('orders.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <pv-data-table
            :value="orders"
            :loading="!ordersLoaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 60rem">
            <pv-column field="customerId" :header="t('orders.customer')" sortable>
                <template #body="{ data }">{{ resolveUserName(data.customerId) }}</template>
            </pv-column>
            <pv-column field="carpenterId" :header="t('orders.carpenter')" sortable>
                <template #body="{ data }">{{ resolveUserName(data.carpenterId) }}</template>
            </pv-column>
            <pv-column :header="t('orders.furniture-type')">
                <template #body="{ data }">{{ data.details.furnitureType }}</template>
            </pv-column>
            <pv-column :header="t('orders.material')">
                <template #body="{ data }">{{ data.details.material }}</template>
            </pv-column>
            <pv-column :header="t('orders.quote-title')">
                <template #body="{ data }">
                    <pv-tag
                        v-if="data.quote"
                        :value="t(`quotes.status-${normalizeQuoteStatus(data.quote.status)}`)"
                        :severity="quoteSeverity(data.quote.status)" />
                    <span v-else class="text-color-secondary">—</span>
                </template>
            </pv-column>
            <pv-column :header="t('orders.status')" sortable field="status">
                <template #body="{ data }">
                    <pv-tag :value="t(orderStatusKey(data.status))" :severity="orderStatusSeverity(data.status)" />
                </template>
            </pv-column>
            <pv-column :header="t('orders.actions')">
                <template #body="{ data }">
                    <pv-button icon="pi pi-eye" text rounded v-tooltip.top="t('orders.actions-tracking')"
                               :aria-label="t('orders.actions-tracking')" @click="navigateToTracking(data.id)" />
                    <pv-button v-if="isPending(data)" icon="pi pi-pencil" text rounded
                               v-tooltip.top="t('orders.actions-edit')" :aria-label="t('orders.actions-edit')"
                               @click="navigateToEdit(data.id)" />
                    <pv-button v-if="isPending(data)" icon="pi pi-check" text rounded severity="success"
                               v-tooltip.top="t('orders.actions-accept')" :aria-label="t('orders.actions-accept')"
                               @click="confirmAccept(data)" />
                    <pv-button v-if="isPending(data)" icon="pi pi-times" text rounded severity="danger"
                               v-tooltip.top="t('orders.actions-reject')" :aria-label="t('orders.actions-reject')"
                               @click="confirmReject(data)" />
                    <pv-button v-if="data.isCancellable" icon="pi pi-ban" text rounded severity="warn"
                               v-tooltip.top="t('orders.actions-cancel')" :aria-label="t('orders.actions-cancel')"
                               @click="confirmCancel(data)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
