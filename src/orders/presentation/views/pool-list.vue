<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { onMounted, ref, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import useCustomersStore from '../../../customers/application/customers.store.js';

const { t }   = useI18n();
const router  = useRouter();
const confirm = useConfirm();
const store   = useOrdersStore();
const customersStore = useCustomersStore();
const { poolOrders, errors } = toRefs(store);

const loaded = ref(false);

onMounted(async () => {
    customersStore.fetchCustomers();
    await store.fetchPool();
    loaded.value = true;
});

/** Resolves a pool order's customer to a display name via the customers store. */
const customerName = (customerId) =>
    customersStore.customerById(customerId)?.fullName || `#${customerId}`;

const navigateToTracking = (id) => router.push({ name: 'orders-tracking', params: { id } });

/** Confirms claiming (accepting) a pool order; the store drops it on success. */
const confirmClaim = (order) => {
    confirm.require({
        message: t('orders.confirm-claim', { id: order.id }),
        header: t('orders.claim-header'),
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: t('orders.actions-claim'),
        rejectLabel: t('common.cancel'),
        acceptClass: 'p-button-primary',
        rejectClass: 'p-button-outlined p-button-secondary',
        accept: () => store.acceptOrder(order.id)
    });
};

const back = () => router.push({ name: 'orders-list' });
</script>

<template>
    <div class="p-4">
        <div class="flex align-items-center gap-2 mb-3">
            <pv-button icon="pi pi-arrow-left" text rounded v-tooltip.top="t('common.back')"
                       :aria-label="t('common.back')" @click="back" />
            <h1 class="text-2xl font-semibold">{{ t('orders.pool-title') }}</h1>
        </div>
        <p class="text-color-secondary mt-0 mb-3">{{ t('orders.pool-subtitle') }}</p>

        <pv-data-table
            :value="poolOrders"
            :loading="!loaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 60rem">
            <template #empty>
                <span class="text-color-secondary">{{ t('orders.pool-empty') }}</span>
            </template>
            <pv-column field="id" :header="t('orders.id')" sortable />
            <pv-column field="customerId" :header="t('orders.customer')" sortable>
                <template #body="{ data }">{{ customerName(data.customerId) }}</template>
            </pv-column>
            <pv-column :header="t('orders.furniture-type')">
                <template #body="{ data }">{{ data.details.furnitureType }}</template>
            </pv-column>
            <pv-column :header="t('orders.material')">
                <template #body="{ data }">{{ data.details.material }}</template>
            </pv-column>
            <pv-column :header="t('orders.dimensions')">
                <template #body="{ data }">{{ data.details.width }} × {{ data.details.height }} × {{ data.details.depth }} cm</template>
            </pv-column>
            <pv-column :header="t('orders.actions')">
                <template #body="{ data }">
                    <pv-button icon="pi pi-eye" text rounded v-tooltip.top="t('orders.actions-tracking')"
                               :aria-label="t('orders.actions-tracking')" @click="navigateToTracking(data.id)" />
                    <pv-button size="small" :label="t('orders.actions-claim')" icon="pi pi-check"
                               @click="confirmClaim(data)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
