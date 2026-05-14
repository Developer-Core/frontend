<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { computed, onMounted, toRefs } from 'vue';
import useQuotesStore from '../../application/quotes.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();

const quotesStore = useQuotesStore();
const ordersStore = useOrdersStore();

const { quotes, quoteItems, quotesLoaded, quoteItemsLoaded, errors } = toRefs(quotesStore);
const { orders } = toRefs(ordersStore);

const { fetchQuotes, fetchQuoteItems, deleteQuote, profitabilityOf, getItemsByQuoteId } = quotesStore;
const { fetchOrders } = ordersStore;

onMounted(() => {
    if (!quotesStore.quotesLoaded)     fetchQuotes();
    if (!quotesStore.quoteItemsLoaded) fetchQuoteItems();
    if (!ordersStore.ordersLoaded)     fetchOrders();
});

/**
 * Quote rows enriched with the related order and the profitability breakdown.
 * @type {import('vue').ComputedRef<Array<{quote: import('../../domain/quote.entity.js').Quote, order: import('../../../orders/domain/order.entity.js').Order|undefined, totalCost: number, profit: number}>>}
 */
const rows = computed(() => {
    return quotes.value.map(quote => {
        const order = orders.value.find(o => o.id === quote.orderId);
        const items = getItemsByQuoteId(quote.id);
        const breakdown = profitabilityOf(quote, items);
        return { quote, order, totalCost: breakdown.totalCost, profit: breakdown.profit };
    });
});

/**
 * Maps a quote status to a PrimeVue tag severity.
 * @param {string} status - Quote status value.
 * @returns {string} PrimeVue severity name.
 */
const severityFor = (status) => {
    switch (status) {
        case 'draft':    return 'secondary';
        case 'sent':     return 'info';
        case 'accepted': return 'success';
        case 'rejected': return 'danger';
        default:         return 'contrast';
    }
};

/** Navigate to the new quote wizard. */
const navigateToNew = () => {
    router.push({ name: 'quotes-new' });
};

/**
 * Confirm and delete a quote.
 * @param {Object} quote - Quote entity to delete.
 */
const confirmDelete = (quote) => {
    confirm.require({
        message: t('quotes.confirm-delete', { id: quote.id }),
        header:  t('quotes.delete-header'),
        icon:    'pi pi-exclamation-triangle',
        accept:  () => deleteQuote(quote)
    });
};
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('quotes.title') }}</h1>
            <pv-button :label="t('quotes.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <pv-data-table
            :value="rows"
            :loading="!quotesLoaded || !quoteItemsLoaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 60rem">
            <pv-column :header="t('quotes.id')" sortable>
                <template #body="slotProps">#{{ slotProps.data.quote.id }}</template>
            </pv-column>
            <pv-column :header="t('quotes.order')">
                <template #body="slotProps">{{ slotProps.data.order?.projectName ?? '—' }}</template>
            </pv-column>
            <pv-column :header="t('quotes.client')">
                <template #body="slotProps">{{ slotProps.data.order?.clientName ?? '—' }}</template>
            </pv-column>
            <pv-column :header="t('quotes.total')">
                <template #body="slotProps">S/ {{ slotProps.data.totalCost.toFixed(2) }}</template>
            </pv-column>
            <pv-column :header="t('quotes.profit')">
                <template #body="slotProps">S/ {{ slotProps.data.profit.toFixed(2) }}</template>
            </pv-column>
            <pv-column :header="t('quotes.status')">
                <template #body="slotProps">
                    <pv-tag :value="t(`quotes.status-${slotProps.data.quote.status}`)" :severity="severityFor(slotProps.data.quote.status)" />
                </template>
            </pv-column>
            <pv-column :header="t('quotes.actions')">
                <template #body="slotProps">
                    <pv-button
                        icon="pi pi-trash"
                        text rounded severity="danger"
                        :aria-label="t('quotes.actions-delete')"
                        v-tooltip.top="t('quotes.actions-delete')"
                        @click="confirmDelete(slotProps.data.quote)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>

        <pv-confirm-dialog />
    </div>
</template>
