<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import useOrdersStore from '../../application/orders.store.js';
import useIamStore from '../../../iam/application/iam.store.js';

const { t }    = useI18n();
const route    = useRoute();
const router   = useRouter();
const store    = useOrdersStore();
const iamStore = useIamStore();
const { errors } = toRefs(store);

const isEdit    = computed(() => Boolean(route.params.id));
const submitted = ref(false);

/**
 * Flat form model matching the backend Create/Update order resources.
 * On create it also carries carpenterId; customerId comes from the signed-in user.
 */
const form = reactive({
    carpenterId:   null,
    furnitureType: '',
    width:         null,
    height:        null,
    depth:         null,
    material:      '',
    designNotes:   ''
});

/**
 * Carpenter options for the selector: each registered carpenter shown by full
 * name (resolved from their profile by email), falling back to the email.
 */
const carpenterOptions = computed(() => iamStore.users.map(user => {
    const profile = iamStore.profiles.find(p => p.email === user.email);
    return { id: user.id, label: profile?.fullName || user.email };
}));

onMounted(async () => {
    if (!isEdit.value) {
        iamStore.fetchUsers('Carpenter');
        iamStore.fetchProfiles();
    }
    if (isEdit.value) {
        let order = store.getOrderById(route.params.id);
        if (!order) {
            await store.fetchOrderById(route.params.id);
            order = store.currentOrder;
        }
        if (order) {
            form.carpenterId   = order.carpenterId;
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

/** Validates and submits the order (create or modify), then returns to the list. */
async function submit() {
    submitted.value = true;
    if (!detailsValid.value) return;
    if (isEdit.value) {
        const updated = await store.modifyOrder(route.params.id, detailsPayload());
        if (updated) router.push({ name: 'orders-list' });
    } else {
        if (!form.carpenterId) return;
        const created = await store.createOrder({
            customerId:  iamStore.currentUserId,
            carpenterId: Number(form.carpenterId),
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
        <div class="w-full" style="max-width: 44rem;">
            <pv-card>
                <template #title>{{ isEdit ? t('orders.edit-title') : t('orders.new-title') }}</template>
                <template #subtitle>{{ t('orders.form-subtitle') }}</template>
                <template #content>
                    <form class="p-fluid flex flex-column gap-3 mt-2" novalidate @submit.prevent="submit">
                        <div v-if="!isEdit" class="field">
                            <label for="carpenterId" class="block mb-1 font-medium">{{ t('orders.carpenter') }}</label>
                            <pv-select id="carpenterId" v-model="form.carpenterId" :options="carpenterOptions"
                                       option-label="label" option-value="id" filter
                                       :placeholder="t('orders.carpenter-placeholder')"
                                       :empty-message="t('orders.carpenter-empty')"
                                       class="w-full" :class="{ 'p-invalid': submitted && !form.carpenterId }" />
                            <small v-if="submitted && !form.carpenterId" class="text-red-500">{{ t('orders.carpenter-required') }}</small>
                            <small v-else class="text-color-secondary">{{ t('orders.carpenter-hint') }}</small>
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
</style>
