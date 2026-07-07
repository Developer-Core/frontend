<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import useCustomersStore from '../../../customers/application/customers.store.js';
import { OrderStatus, orderStatusKey, orderStatusSeverity } from '../../domain/order-status.js';
import { PaymentType, paymentStatusKey, paymentStatusSeverity, paymentTypeKey } from '../../domain/payment.entity.js';

const { t }  = useI18n();
const route  = useRoute();
const router = useRouter();
const store  = useOrdersStore();
const iamStore = useIamStore();
const customersStore = useCustomersStore();
const { errors } = toRefs(store);

/** @type {import('vue').ComputedRef<?import('../../domain/order.entity.js').Order>} */
const order = computed(() => store.currentOrder);

const isCarpenter = computed(() => iamStore.currentRole === 'Carpenter');

/** The customer record for this order (carpenter view resolves it from the store). */
const customer = computed(() => order.value ? customersStore.customerById(order.value.customerId) : null);

/** Display name for the order's customer. */
const customerLabel = computed(() =>
    customer.value?.fullName || (order.value ? `#${order.value.customerId}` : ''));

// --- Lifecycle action gating (carpenter only) ---
const canAccept  = computed(() => isCarpenter.value && order.value?.status === OrderStatus.PENDING);
// A carpenter proposes the quote only after claiming/accepting the order, and only once.
const canGenerateQuote = computed(() =>
    isCarpenter.value && order.value?.status === OrderStatus.ACCEPTED && !order.value?.quote);
// Production starts once the order is accepted and its quote has been agreed.
const canStart   = computed(() =>
    isCarpenter.value && order.value?.status === OrderStatus.ACCEPTED && quoteAccepted.value);
const canReady   = computed(() => isCarpenter.value && order.value?.status === OrderStatus.IN_PROGRESS);
const canComplete = computed(() => isCarpenter.value && order.value?.status === OrderStatus.READY_FOR_DELIVERY);
const hasLifecycleActions = computed(() =>
    canAccept.value || canStart.value || canReady.value || canComplete.value);

// --- WhatsApp contact ---
const workshopWhatsapp = import.meta.env.VITE_WORKSHOP_WHATSAPP || '51999999999';

/** Digits-only phone for a wa.me link, or null when unavailable. */
const customerPhone = computed(() => {
    const raw = customer.value?.phone ?? '';
    const digits = String(raw).replace(/\D/g, '');
    return digits || null;
});

/** Whether the WhatsApp button can be used (carpenter needs a customer phone). */
const canWhatsapp = computed(() => isCarpenter.value ? !!customerPhone.value : true);

/** Opens WhatsApp: the carpenter contacts the customer; the client contacts the workshop. */
function contactWhatsapp() {
    if (!order.value || !canWhatsapp.value) return;
    const reference = order.value.publicTrackingId || `#${order.value.id}`;
    const text = encodeURIComponent(t('orders.whatsapp-text', { reference }));
    const phone = isCarpenter.value ? customerPhone.value : workshopWhatsapp;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');
}

const quoteForm   = reactive({ materialsCost: null, laborCost: null, estimatedProductionDays: null });
const paymentForm = reactive({ type: PaymentType.DEPOSIT, amount: null, receiptReference: '' });

const paymentTypeOptions = computed(() => [
    { label: t('orders.deposit'),       value: PaymentType.DEPOSIT },
    { label: t('orders.final-payment'), value: PaymentType.FINAL_PAYMENT }
]);

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

onMounted(() => {
    store.fetchOrderById(route.params.id);
    // The carpenter needs the customers directory to resolve the name and phone.
    if (isCarpenter.value) customersStore.fetchCustomers();
});

/** A terminal order accepts no more quote/payment actions. */
const isTerminal = computed(() => !!order.value &&
    [OrderStatus.CANCELLED, OrderStatus.REJECTED, OrderStatus.COMPLETED].includes(order.value.status));

const canAcceptQuote = computed(() => !isTerminal.value && order.value?.quote &&
    normalizeQuoteStatus(order.value.quote.status) !== 'accepted');

// --- Payment balance (computed on the client; the backend does not track it) ---
const quoteTotal    = computed(() => Number(order.value?.quote?.total ?? 0));
const quoteAccepted = computed(() => normalizeQuoteStatus(order.value?.quote?.status) === 'accepted');
const totalPaid     = computed(() => (order.value?.payments ?? [])
    .filter(p => p.status === 'Confirmed').reduce((sum, p) => sum + Number(p.amount || 0), 0));
const totalPending  = computed(() => (order.value?.payments ?? [])
    .filter(p => p.status === 'PendingValidation').reduce((sum, p) => sum + Number(p.amount || 0), 0));
const remaining     = computed(() => Math.max(0, quoteTotal.value - totalPaid.value));

/** Payments are only allowed once the quote is accepted and the order is in a payable state. */
const isPayable = computed(() => !isTerminal.value && quoteAccepted.value &&
    [OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS, OrderStatus.READY_FOR_DELIVERY].includes(order.value?.status));

const amountExceedsRemaining = computed(() =>
    quoteTotal.value > 0 && Number(paymentForm.amount) > remaining.value);
const paymentValid = computed(() =>
    Number(paymentForm.amount) > 0 && !!paymentForm.receiptReference && !amountExceedsRemaining.value);

/** Formats an amount as Peruvian soles. */
const money = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value || 0));

/** Generates the quote from the mini-form. */
function submitQuote() {
    if (!(quoteForm.materialsCost >= 0) || !(quoteForm.laborCost >= 0) || !(quoteForm.estimatedProductionDays > 0)) return;
    store.generateQuote(route.params.id, {
        materialsCost:           Number(quoteForm.materialsCost),
        laborCost:               Number(quoteForm.laborCost),
        estimatedProductionDays: Number(quoteForm.estimatedProductionDays)
    });
}

/** Registers a payment from the mini-form (only when valid and within the remaining balance). */
function submitPayment() {
    if (!isPayable.value || !paymentValid.value) return;
    store.registerPayment(route.params.id, {
        type:             paymentForm.type,
        amount:           Number(paymentForm.amount),
        receiptReference: paymentForm.receiptReference
    }).then(() => { paymentForm.amount = null; paymentForm.receiptReference = ''; });
}

const back = () => router.push({ name: 'orders-list' });
</script>

<template>
    <div class="p-4">
        <div class="flex align-items-center gap-2 mb-3">
            <pv-button icon="pi pi-arrow-left" text rounded v-tooltip.top="t('common.back')"
                       :aria-label="t('common.back')" @click="back" />
            <h1 class="text-2xl font-semibold">{{ t('orders.tracking-title') }}</h1>
        </div>

        <template v-if="order">
            <pv-card class="mb-3">
                <template #title>
                    <div class="flex justify-content-between align-items-start gap-2 flex-wrap">
                        <span>{{ t('orders.id') }} #{{ order.id }}</span>
                        <pv-tag :value="t(orderStatusKey(order.status))" :severity="orderStatusSeverity(order.status)" />
                    </div>
                </template>
                <template #content>
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <p v-if="isCarpenter"><strong>{{ t('orders.customer') }}:</strong> {{ customerLabel }}</p>
                            <p><strong>{{ t('orders.furniture-type') }}:</strong> {{ order.details.furnitureType }}</p>
                            <p><strong>{{ t('orders.material') }}:</strong> {{ order.details.material }}</p>
                        </div>
                        <div class="col-12 md:col-6">
                            <p><strong>{{ t('orders.dimensions') }}:</strong>
                                {{ order.details.width }} × {{ order.details.height }} × {{ order.details.depth }} cm</p>
                            <p class="order-tracking__wrap"><strong>{{ t('public-tracking.tracking-code') }}:</strong> {{ order.publicTrackingId ?? '—' }}</p>
                        </div>
                        <div class="col-12 mt-2">
                            <p><strong>{{ t('orders.design-notes') }}:</strong></p>
                            <p class="text-color-secondary">{{ order.details.designNotes || '—' }}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 mt-2 align-items-center">
                        <pv-button v-if="canAccept" size="small" :label="t('orders.actions-accept')" icon="pi pi-check"
                                   severity="success" @click="store.acceptOrder(order.id)" />
                        <pv-button v-if="canStart" size="small" :label="t('orders.actions-start')" icon="pi pi-play"
                                   @click="store.startProduction(order.id)" />
                        <pv-button v-if="canReady" size="small" :label="t('orders.actions-ready')" icon="pi pi-box"
                                   @click="store.markReady(order.id)" />
                        <pv-button v-if="canComplete" size="small" :label="t('orders.actions-complete')" icon="pi pi-flag"
                                   severity="success" @click="store.completeOrder(order.id)" />
                        <span v-if="hasLifecycleActions" class="flex-1" />
                        <span v-tooltip.top="!canWhatsapp ? t('orders.whatsapp-no-phone') : ''">
                            <pv-button size="small" severity="success" outlined icon="pi pi-whatsapp"
                                       :label="t('orders.contact-whatsapp')" :disabled="!canWhatsapp"
                                       @click="contactWhatsapp" />
                        </span>
                    </div>
                </template>
            </pv-card>

            <!-- Quote -->
            <pv-card class="mb-3">
                <template #title>{{ t('orders.quote-title') }}</template>
                <template #content>
                    <div v-if="order.quote" class="grid">
                        <div class="col-6 md:col-3"><small class="text-color-secondary block">{{ t('orders.materials-cost') }}</small>{{ order.quote.materialsCost }}</div>
                        <div class="col-6 md:col-3"><small class="text-color-secondary block">{{ t('orders.labor-cost') }}</small>{{ order.quote.laborCost }}</div>
                        <div class="col-6 md:col-3"><small class="text-color-secondary block">{{ t('orders.total') }}</small><strong>{{ order.quote.total }}</strong></div>
                        <div class="col-6 md:col-3"><small class="text-color-secondary block">{{ t('orders.production-days') }}</small>{{ order.quote.estimatedProductionDays }}</div>
                        <div class="col-12 mt-2 flex align-items-center gap-2">
                            <pv-tag
                                :value="t(`quotes.status-${normalizeQuoteStatus(order.quote.status)}`)"
                                :severity="quoteSeverity(order.quote.status)" />
                            <pv-button v-if="canAcceptQuote" size="small" :label="t('orders.accept-quote')"
                                       icon="pi pi-check" @click="store.acceptQuote(order.id)" />
                        </div>
                    </div>
                    <p v-else-if="!isCarpenter && !isTerminal" class="text-color-secondary m-0">{{ t('orders.no-quote') }}</p>
                    <form v-else-if="canGenerateQuote" class="formgrid grid p-fluid" @submit.prevent="submitQuote">
                        <p class="col-12 text-color-secondary m-0 mb-2">{{ t('orders.no-quote') }}</p>
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.materials-cost') }}</label>
                            <pv-input-number v-model="quoteForm.materialsCost" :min="0" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
                        </div>
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.labor-cost') }}</label>
                            <pv-input-number v-model="quoteForm.laborCost" :min="0" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
                        </div>
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.production-days') }}</label>
                            <pv-input-number v-model="quoteForm.estimatedProductionDays" :min="1" class="w-full" />
                        </div>
                        <div class="col-12 flex justify-content-end">
                            <pv-button type="submit" size="small" :label="t('orders.generate-quote')" icon="pi pi-file-edit" />
                        </div>
                    </form>
                    <p v-else class="text-color-secondary m-0">{{ t('orders.quote-unavailable') }}</p>
                </template>
            </pv-card>

            <!-- Payments -->
            <pv-card>
                <template #title>{{ t('orders.payments-title') }}</template>
                <template #content>
                    <div v-if="order.quote" class="grid mb-3">
                        <div class="col-4"><small class="text-color-secondary block">{{ t('orders.total') }}</small><strong>{{ money(quoteTotal) }}</strong></div>
                        <div class="col-4"><small class="text-color-secondary block">{{ t('orders.paid') }}</small>{{ money(totalPaid) }}</div>
                        <div class="col-4"><small class="text-color-secondary block">{{ t('orders.remaining') }}</small>
                            <strong :style="remaining > 0 ? 'color: var(--p-primary-color);' : 'color: var(--p-green-600);'">{{ money(remaining) }}</strong>
                        </div>
                        <div v-if="totalPending > 0" class="col-12">
                            <small class="text-color-secondary">{{ t('orders.pending-validation-amount', { amount: money(totalPending) }) }}</small>
                        </div>
                    </div>

                    <pv-data-table v-if="order.payments.length" :value="order.payments" class="mb-3">
                        <pv-column field="id" :header="t('orders.id')" />
                        <pv-column :header="t('orders.payment-type')">
                            <template #body="{ data }">{{ t(paymentTypeKey(data.type)) }}</template>
                        </pv-column>
                        <pv-column field="amount" :header="t('orders.amount')" />
                        <pv-column field="receiptReference" :header="t('orders.receipt-reference')" />
                        <pv-column :header="t('orders.status')">
                            <template #body="{ data }">
                                <pv-tag
                                    :value="t(paymentStatusKey(data.status))"
                                    :severity="paymentStatusSeverity(data.status)" />
                            </template>
                        </pv-column>
                        <pv-column :header="t('orders.actions')">
                            <template #body="{ data }">
                                <template v-if="isCarpenter && data.status === 'PendingValidation'">
                                    <pv-button icon="pi pi-check" text rounded severity="success"
                                               v-tooltip.top="t('orders.approve')"
                                               @click="store.validatePayment(order.id, data.id, true)" />
                                    <pv-button icon="pi pi-times" text rounded severity="danger"
                                               v-tooltip.top="t('orders.reject')"
                                               @click="store.validatePayment(order.id, data.id, false)" />
                                </template>
                            </template>
                        </pv-column>
                    </pv-data-table>
                    <p v-else class="text-color-secondary mt-0">{{ t('orders.no-payments') }}</p>

                    <form v-if="isPayable" class="formgrid grid p-fluid mt-2" @submit.prevent="submitPayment">
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.payment-type') }}</label>
                            <pv-select v-model="paymentForm.type" :options="paymentTypeOptions"
                                       option-label="label" option-value="value" class="w-full" />
                        </div>
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.amount') }}</label>
                            <pv-input-number v-model="paymentForm.amount" :min="0" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
                        </div>
                        <div class="field col-12 lg:col-4 order-tracking__field">
                            <label class="block mb-1 font-medium">{{ t('orders.receipt-reference') }}</label>
                            <pv-input-text v-model="paymentForm.receiptReference" class="w-full" />
                        </div>
                        <div class="col-12 flex justify-content-between align-items-center flex-wrap gap-2">
                            <small v-if="amountExceedsRemaining" class="text-red-500">
                                {{ t('orders.amount-exceeds-remaining', { amount: money(remaining) }) }}
                            </small>
                            <span v-else />
                            <pv-button type="submit" size="small" :label="t('orders.register-payment')"
                                       icon="pi pi-wallet" :disabled="!paymentValid" />
                        </div>
                    </form>
                    <p v-else-if="!isTerminal" class="text-color-secondary m-0">{{ t('orders.payment-unavailable') }}</p>
                </template>
            </pv-card>
        </template>

        <div v-else class="text-color-secondary">{{ t('orders.not-found') }}</div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>

<style scoped>
.order-tracking__field {
    min-width: 0;
}

.order-tracking__field :deep(.p-inputnumber),
.order-tracking__field :deep(.p-inputnumber-input) {
    width: 100%;
    min-width: 0;
}

.order-tracking__wrap {
    overflow-wrap: anywhere;
}
</style>
