<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import { OrderStatus, orderStatusKey, orderStatusSeverity } from '../../domain/order-status.js';
import { PaymentType } from '../../domain/payment.entity.js';

const { t }  = useI18n();
const route  = useRoute();
const router = useRouter();
const store  = useOrdersStore();
const { errors } = toRefs(store);

/** @type {import('vue').ComputedRef<?import('../../domain/order.entity.js').Order>} */
const order = computed(() => store.currentOrder);

const quoteForm   = reactive({ materialsCost: null, laborCost: null, estimatedProductionDays: null });
const paymentForm = reactive({ type: PaymentType.DEPOSIT, amount: null, receiptReference: '' });

const paymentTypeOptions = computed(() => [
    { label: t('orders.deposit'),       value: PaymentType.DEPOSIT },
    { label: t('orders.final-payment'), value: PaymentType.FINAL_PAYMENT }
]);

onMounted(() => store.fetchOrderById(route.params.id));

const canAcceptQuote = computed(() => order.value?.quote && order.value.quote.status !== 'Accepted');

/** Generates the quote from the mini-form. */
function submitQuote() {
    if (!(quoteForm.materialsCost >= 0) || !(quoteForm.laborCost >= 0) || !(quoteForm.estimatedProductionDays > 0)) return;
    store.generateQuote(route.params.id, {
        materialsCost:           Number(quoteForm.materialsCost),
        laborCost:               Number(quoteForm.laborCost),
        estimatedProductionDays: Number(quoteForm.estimatedProductionDays)
    });
}

/** Registers a payment from the mini-form. */
function submitPayment() {
    if (!(paymentForm.amount > 0) || !paymentForm.receiptReference) return;
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
                            <p><strong>{{ t('orders.customer') }}:</strong> {{ order.customerId }}</p>
                            <p><strong>{{ t('orders.carpenter') }}:</strong> {{ order.carpenterId }}</p>
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
                            <pv-tag :value="order.quote.status" severity="info" />
                            <pv-button v-if="canAcceptQuote" size="small" :label="t('orders.accept-quote')"
                                       icon="pi pi-check" @click="store.acceptQuote(order.id)" />
                        </div>
                    </div>
                    <form v-else class="formgrid grid p-fluid" @submit.prevent="submitQuote">
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
                </template>
            </pv-card>

            <!-- Payments -->
            <pv-card>
                <template #title>{{ t('orders.payments-title') }}</template>
                <template #content>
                    <pv-data-table v-if="order.payments.length" :value="order.payments" class="mb-3">
                        <pv-column field="id" :header="t('orders.id')" />
                        <pv-column :header="t('orders.payment-type')">
                            <template #body="{ data }">{{ data.type }}</template>
                        </pv-column>
                        <pv-column field="amount" :header="t('orders.amount')" />
                        <pv-column field="receiptReference" :header="t('orders.receipt-reference')" />
                        <pv-column :header="t('orders.status')">
                            <template #body="{ data }"><pv-tag :value="data.status" /></template>
                        </pv-column>
                        <pv-column :header="t('orders.actions')">
                            <template #body="{ data }">
                                <template v-if="data.status === 'PendingValidation'">
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

                    <form class="formgrid grid p-fluid mt-2" @submit.prevent="submitPayment">
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
                        <div class="col-12 flex justify-content-end">
                            <pv-button type="submit" size="small" :label="t('orders.register-payment')" icon="pi pi-wallet" />
                        </div>
                    </form>
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
