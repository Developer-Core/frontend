<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { useConfirm } from 'primevue';
import useOrdersStore from '../../application/orders.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import useCustomersStore from '../../../customers/application/customers.store.js';

const { t }    = useI18n();
const route    = useRoute();
const router   = useRouter();
const confirm  = useConfirm();
const store    = useOrdersStore();
const iamStore = useIamStore();
const customersStore = useCustomersStore();
const { errors } = toRefs(store);

const isEdit     = computed(() => Boolean(route.params.id));
const isCarpenter = computed(() => iamStore.currentRole === 'Carpenter');
const submitted  = ref(false);

/**
 * Flat form model matching the backend furniture fields. On create, a carpenter
 * also picks the target `customerId`; a client sends only the furniture fields.
 */
const form = reactive({
    customerId:    null,
    furnitureType: '',
    width:         null,
    height:        null,
    depth:         null,
    material:      '',
    designNotes:   ''
});

/** Customer options for the carpenter's selector, shown by full name. */
const customerOptions = computed(() => customersStore.customers.map(customer => ({
    id: customer.id, label: customer.fullName || customer.email
})));

/** Routes the carpenter to register a new customer. */
const goToNewCustomer = () => router.push({ name: 'customers-new' });

onMounted(async () => {
    if (!isEdit.value && isCarpenter.value) {
        customersStore.fetchCustomers();
    }
    if (isEdit.value) {
        let order = store.getOrderById(route.params.id);
        if (!order) {
            await store.fetchOrderById(route.params.id);
            order = store.currentOrder;
        }
        if (order) {
            form.customerId    = order.customerId;
            form.furnitureType = order.details.furnitureType;
            form.width         = order.details.width;
            form.height        = order.details.height;
            form.depth         = order.details.depth;
            form.material      = order.details.material;
            form.designNotes   = order.details.designNotes;
        }
    }
});

const detailsValid = computed(() =>
    form.furnitureType && form.material && form.width > 0 && form.height > 0 && form.depth > 0);

/** Builds the details payload shared by create and update. */
const detailsPayload = () => ({
    furnitureType: form.furnitureType,
    width:         Number(form.width),
    height:        Number(form.height),
    depth:         Number(form.depth),
    material:      form.material,
    designNotes:   form.designNotes
});

async function persist() {
    const updated = await store.modifyOrder(route.params.id, detailsPayload());
    if (updated) router.push({ name: 'orders-list' });
}

/** Validates and submits the order (create or modify), then returns to the list. */
async function submit() {
    submitted.value = true;
    if (!detailsValid.value) return;
    if (isEdit.value) {
        confirm.require({
            message: t('orders.confirmSaveEdit', { id: route.params.id }),
            header: t('orders.edit-title'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: t('common.save'),
            rejectLabel: t('common.cancel'),
            acceptClass: 'p-button-primary',
            rejectClass: 'p-button-outlined p-button-secondary',
            accept: persist
        });
    } else {
        if (isCarpenter.value && !form.customerId) return;
        const created = await store.createOrder({
            ...(isCarpenter.value ? { customerId: Number(form.customerId) } : {}),
            ...detailsPayload()
        });
        if (created) router.push({ name: 'orders-list' });
    }
}

/** Cancels and returns to the list. */
const cancel = () => router.push({ name: 'orders-list' });
</script>

<template>
    <div class="p-4 flex justify-content-center">
        <div class="order-form__shell w-full">
            <pv-card>
                <template #title>{{ isEdit ? t('orders.edit-title') : t('orders.new-title') }}</template>
                <template #subtitle>{{ t('orders.form-subtitle') }}</template>
                <template #content>
                    <form class="p-fluid flex flex-column gap-3 mt-2" novalidate @submit.prevent="submit">
                        <div v-if="!isEdit && isCarpenter" class="field">
                            <div class="flex justify-content-between align-items-center mb-1">
                                <label for="customerId" class="font-medium">{{ t('orders.customer') }}</label>
                                <pv-button type="button" :label="t('orders.new-customer')" icon="pi pi-plus"
                                           size="small" text @click="goToNewCustomer" />
                            </div>
                            <pv-select id="customerId" v-model="form.customerId" :options="customerOptions"
                                       option-label="label" option-value="id" filter
                                       :placeholder="t('orders.customer-placeholder')"
                                       :empty-message="t('orders.customer-empty')"
                                       class="w-full" :class="{ 'p-invalid': submitted && !form.customerId }" />
                            <small v-if="submitted && !form.customerId" class="text-red-500">{{ t('orders.customer-required') }}</small>
                            <small v-else class="text-color-secondary">{{ t('orders.customer-hint') }}</small>
                        </div>

                        <div class="field">
                            <label for="furnitureType" class="block mb-1 font-medium">{{ t('orders.furniture-type') }}</label>
                            <pv-input-text id="furnitureType" v-model="form.furnitureType" class="w-full"
                                           :class="{ 'p-invalid': submitted && !form.furnitureType }"
                                           :placeholder="t('orders.furniture-type-placeholder')" />
                        </div>

                        <div class="field">
                            <label class="block mb-1 font-medium">{{ t('orders.dimensions') }}</label>
                            <div class="formgrid grid dimensions-grid">
                                <div class="field col-12 md:col-4 mb-0 dimensions-grid__item">
                                    <pv-input-number v-model="form.width" :min="0" suffix=" cm" :max-fraction-digits="2"
                                                     class="w-full" :placeholder="t('orders.width')"
                                                     :class="{ 'p-invalid': submitted && !(form.width > 0) }" />
                                </div>
                                <div class="field col-12 md:col-4 mb-0 dimensions-grid__item">
                                    <pv-input-number v-model="form.height" :min="0" suffix=" cm" :max-fraction-digits="2"
                                                     class="w-full" :placeholder="t('orders.height')"
                                                     :class="{ 'p-invalid': submitted && !(form.height > 0) }" />
                                </div>
                                <div class="field col-12 md:col-4 mb-0 dimensions-grid__item">
                                    <pv-input-number v-model="form.depth" :min="0" suffix=" cm" :max-fraction-digits="2"
                                                     class="w-full" :placeholder="t('orders.depth')"
                                                     :class="{ 'p-invalid': submitted && !(form.depth > 0) }" />
                                </div>
                            </div>
                            <small class="text-color-secondary">{{ t('orders.dimensions-hint') }}</small>
                        </div>

                        <div class="field">
                            <label for="material" class="block mb-1 font-medium">{{ t('orders.material') }}</label>
                            <pv-input-text id="material" v-model="form.material" class="w-full"
                                           :class="{ 'p-invalid': submitted && !form.material }"
                                           :placeholder="t('orders.material-placeholder')" />
                        </div>

                        <div class="field">
                            <label for="designNotes" class="block mb-1 font-medium">{{ t('orders.design-notes') }}</label>
                            <pv-textarea id="designNotes" v-model="form.designNotes" rows="4" class="w-full"
                                         :placeholder="t('orders.design-notes-placeholder')" />
                        </div>

                        <div v-if="errors.length" class="text-red-500">
                            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
                        </div>

                        <div class="flex gap-2 justify-content-end mt-2">
                            <pv-button type="button" :label="t('common.cancel')" severity="secondary" text @click="cancel" />
                            <pv-button type="submit" :label="t('common.save')" icon="pi pi-check" />
                        </div>
                    </form>
                </template>
            </pv-card>
        </div>
    </div>
</template>

<style scoped>
.dimensions-grid__item {
    min-width: 0;
}

.dimensions-grid__item :deep(.p-inputnumber) {
    width: 100%;
}

.dimensions-grid__item :deep(.p-inputnumber-input) {
    width: 100%;
    min-width: 0;
}

.order-form__shell {
    max-width: 44rem;
}
</style>
