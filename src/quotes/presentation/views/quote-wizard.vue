<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, toRefs } from 'vue';
import useQuotesStore from '../../application/quotes.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';
import useInventoryStore from '../../../inventory/application/inventory.store.js';
import { Quote } from '../../domain/quote.entity.js';

const { t } = useI18n();
const router = useRouter();

const quotesStore    = useQuotesStore();
const ordersStore    = useOrdersStore();
const inventoryStore = useInventoryStore();

const { errors } = toRefs(quotesStore);
const { orders } = toRefs(ordersStore);
const { materials } = toRefs(inventoryStore);

const { addQuote, profitabilityOf } = quotesStore;
const { fetchOrders }    = ordersStore;
const { fetchMaterials } = inventoryStore;

onMounted(() => {
    if (!ordersStore.ordersLoaded)       fetchOrders();
    if (!inventoryStore.materialsLoaded) fetchMaterials();
});

/**
 * Current wizard step (1: order, 2: materials, 3: labor and summary).
 * @type {import('vue').Ref<number>}
 */
const step = ref(1);

/** Quote draft being assembled across the wizard steps. */
const draft = ref({
    orderId:       null,
    laborHours:    0,
    hourlyRate:    50,
    marginPercent: 20
});

/**
 * Item lines added to the draft quote.
 * @type {import('vue').Ref<Array<{materialId: number, quantity: number, unitCost: number}>>}
 */
const items = ref([]);

/** Material currently selected in the material picker. */
const selectedMaterialId = ref(null);
/** Quantity currently typed in the material picker. */
const draftQuantity = ref(1);

/**
 * Live profitability breakdown derived from the draft and its items.
 * @type {import('vue').ComputedRef<{materialsCost: number, laborCost: number, subtotal: number, profit: number, totalCost: number, marginPercent: number}>}
 */
const breakdown = computed(() =>
    profitabilityOf(
        new Quote({ laborHours: draft.value.laborHours, hourlyRate: draft.value.hourlyRate, marginPercent: draft.value.marginPercent }),
        items.value
    )
);

/**
 * Resolves a material entity by identifier.
 * @param {number} id - Material identifier.
 * @returns {import('../../../inventory/domain/material.entity.js').Material|undefined} Matching material.
 */
const materialOf = (id) => materials.value.find(m => m.id === id);

/** Add the currently picked material and quantity to the items list. */
const addItem = () => {
    const material = materialOf(selectedMaterialId.value);
    if (!material || draftQuantity.value <= 0) return;
    items.value.push({
        materialId: material.id,
        quantity:   draftQuantity.value,
        unitCost:   material.unitCost
    });
    selectedMaterialId.value = null;
    draftQuantity.value = 1;
};

/**
 * Remove an item line from the draft.
 * @param {number} index - Index of the item to remove.
 */
const removeItem = (index) => {
    items.value.splice(index, 1);
};

/** Move forward in the wizard. */
const next = () => { if (step.value < 3) step.value += 1; };
/** Move backward in the wizard. */
const back = () => { if (step.value > 1) step.value -= 1; };
/** Cancel the wizard and return to the quotes list. */
const cancel = () => { router.push({ name: 'quotes-list' }); };

/** Persist the draft quote and navigate back to the list. */
const save = async () => {
    const quote = new Quote({
        orderId:       draft.value.orderId,
        status:        'draft',
        laborHours:    draft.value.laborHours,
        hourlyRate:    draft.value.hourlyRate,
        marginPercent: draft.value.marginPercent,
        createdAt:     new Date().toISOString()
    });
    const persisted = await addQuote(quote, items.value);
    if (persisted) router.push({ name: 'quotes-list' });
};

const canAdvanceStep1 = computed(() => Boolean(draft.value.orderId));
const canAdvanceStep2 = computed(() => items.value.length > 0);
</script>

<template>
    <div class="p-4" style="max-width: 60rem">
        <h1 class="text-2xl font-semibold mb-3">{{ t('quotes.wizard-title') }}</h1>

        <div class="flex gap-3 mb-4">
            <div class="font-medium" :class="{ 'text-primary': step === 1 }">1. {{ t('quotes.step-order') }}</div>
            <div class="font-medium" :class="{ 'text-primary': step === 2 }">2. {{ t('quotes.step-materials') }}</div>
            <div class="font-medium" :class="{ 'text-primary': step === 3 }">3. {{ t('quotes.step-summary') }}</div>
        </div>

        <pv-card v-if="step === 1">
            <template #title>{{ t('quotes.step-order') }}</template>
            <template #content>
                <div class="field mb-3">
                    <label for="order" class="block mb-1 font-medium">{{ t('quotes.order') }}</label>
                    <pv-select
                        id="order"
                        v-model="draft.orderId"
                        :options="orders"
                        option-label="projectName"
                        option-value="id"
                        :placeholder="t('quotes.select-order')"
                        class="w-full" />
                </div>
            </template>
        </pv-card>

        <pv-card v-else-if="step === 2">
            <template #title>{{ t('quotes.step-materials') }}</template>
            <template #content>
                <div class="flex flex-wrap gap-3 mb-3 align-items-end">
                    <div class="field mb-0" style="flex: 1 1 20rem; min-width: 0">
                        <label for="material" class="block mb-1 font-medium">{{ t('quotes.material') }}</label>
                        <pv-select
                            id="material"
                            v-model="selectedMaterialId"
                            :options="materials"
                            option-label="name"
                            option-value="id"
                            :placeholder="t('quotes.select-material')"
                            class="w-full" />
                    </div>
                    <div class="field mb-0" style="flex: 0 0 9rem">
                        <label for="quantity" class="block mb-1 font-medium">{{ t('quotes.quantity') }}</label>
                        <pv-input-number id="quantity" v-model="draftQuantity" :min="0" :max-fraction-digits="2" class="w-full" />
                    </div>
                    <pv-button
                        :label="t('quotes.add')"
                        icon="pi pi-plus"
                        :disabled="!selectedMaterialId"
                        class="flex-shrink-0"
                        @click="addItem" />
                </div>

                <pv-data-table :value="items" striped-rows>
                    <pv-column :header="t('quotes.material')">
                        <template #body="slotProps">{{ materialOf(slotProps.data.materialId)?.name }}</template>
                    </pv-column>
                    <pv-column field="quantity" :header="t('quotes.quantity')" />
                    <pv-column :header="t('quotes.unit-cost')">
                        <template #body="slotProps">S/ {{ slotProps.data.unitCost.toFixed(2) }}</template>
                    </pv-column>
                    <pv-column :header="t('quotes.line-total')">
                        <template #body="slotProps">S/ {{ (slotProps.data.quantity * slotProps.data.unitCost).toFixed(2) }}</template>
                    </pv-column>
                    <pv-column :header="t('quotes.actions')">
                        <template #body="slotProps">
                            <pv-button
                                icon="pi pi-trash"
                                text rounded severity="danger"
                                :aria-label="t('quotes.actions-remove-item')"
                                v-tooltip.top="t('quotes.actions-remove-item')"
                                @click="removeItem(slotProps.index)" />
                        </template>
                    </pv-column>
                </pv-data-table>

                <div class="text-right mt-3 font-medium">
                    {{ t('quotes.materials-cost') }}: S/ {{ breakdown.materialsCost.toFixed(2) }}
                </div>
            </template>
        </pv-card>

        <pv-card v-else>
            <template #title>{{ t('quotes.step-summary') }}</template>
            <template #content>
                <div class="grid mb-4">
                    <div class="col-12 md:col-4 field">
                        <label for="laborHours" class="block mb-1 font-medium">{{ t('quotes.labor-hours') }}</label>
                        <pv-input-number id="laborHours" v-model="draft.laborHours" :min="0" :max-fraction-digits="2" class="w-full" />
                    </div>
                    <div class="col-12 md:col-4 field">
                        <label for="hourlyRate" class="block mb-1 font-medium">{{ t('quotes.hourly-rate') }}</label>
                        <pv-input-number id="hourlyRate" v-model="draft.hourlyRate" :min="0" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
                    </div>
                    <div class="col-12 md:col-4 field">
                        <label for="marginPercent" class="block mb-1 font-medium">{{ t('quotes.margin-percent') }}</label>
                        <pv-input-number id="marginPercent" v-model="draft.marginPercent" :min="0" suffix=" %" class="w-full" />
                    </div>
                </div>

                <div class="p-3 border-round" style="background: var(--p-surface-100)">
                    <div class="flex justify-content-between mb-2">
                        <span>{{ t('quotes.materials-cost') }}</span>
                        <strong>S/ {{ breakdown.materialsCost.toFixed(2) }}</strong>
                    </div>
                    <div class="flex justify-content-between mb-2">
                        <span>{{ t('quotes.labor-cost') }}</span>
                        <strong>S/ {{ breakdown.laborCost.toFixed(2) }}</strong>
                    </div>
                    <div class="flex justify-content-between mb-2 pt-2" style="border-top: 1px solid var(--p-surface-300)">
                        <span>{{ t('quotes.subtotal') }}</span>
                        <strong>S/ {{ breakdown.subtotal.toFixed(2) }}</strong>
                    </div>
                    <div class="flex justify-content-between mb-2">
                        <span>{{ t('quotes.profit') }} ({{ breakdown.marginPercent }} %)</span>
                        <strong>S/ {{ breakdown.profit.toFixed(2) }}</strong>
                    </div>
                    <div class="flex justify-content-between text-xl pt-2" style="border-top: 1px solid var(--p-surface-300)">
                        <span class="font-semibold">{{ t('quotes.total') }}</span>
                        <span class="font-semibold text-primary">S/ {{ breakdown.totalCost.toFixed(2) }}</span>
                    </div>
                </div>
            </template>
        </pv-card>

        <div class="flex justify-content-between mt-4">
            <pv-button :label="t('common.cancel')" severity="secondary" text @click="cancel" />
            <div class="flex gap-2">
                <pv-button v-if="step > 1" :label="t('common.back')" icon="pi pi-arrow-left" severity="secondary" @click="back" />
                <pv-button v-if="step === 1" :label="t('common.next')" icon="pi pi-arrow-right" icon-pos="right" :disabled="!canAdvanceStep1" @click="next" />
                <pv-button v-else-if="step === 2" :label="t('common.next')" icon="pi pi-arrow-right" icon-pos="right" :disabled="!canAdvanceStep2" @click="next" />
                <pv-button v-else :label="t('quotes.save')" icon="pi pi-check" @click="save" />
            </div>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
