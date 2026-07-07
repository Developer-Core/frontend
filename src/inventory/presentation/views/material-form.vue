<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { useConfirm } from 'primevue';
import useInventoryStore from '../../application/inventory.store.js';

const { t }    = useI18n();
const route    = useRoute();
const router   = useRouter();
const confirm  = useConfirm();
const store    = useInventoryStore();
const { errors } = toRefs(store);

const isEdit    = computed(() => Boolean(route.params.id));
const submitted = ref(false);

/** Flat form model matching the backend Create/Update inventory resources. */
const form = reactive({ materialType: '', unit: '', quantity: null, minStock: null });

/** Measurement units offered by the unit picker. */
const unitOptions = [
    { label: 'Tablón',  value: 'tablón' },
    { label: 'Plancha', value: 'plancha' },
    { label: 'Listón',  value: 'listón' },
    { label: 'Metro',   value: 'metro' },
    { label: 'Litro',   value: 'litro' },
    { label: 'Unidad',  value: 'unidad' }
];

onMounted(async () => {
    if (isEdit.value) {
        if (!store.materialsLoaded) await store.fetchMaterials();
        const existing = store.getMaterialById(route.params.id);
        if (existing) {
            form.materialType = existing.materialType;
            form.unit         = existing.unit;
            form.quantity     = existing.quantity;
            form.minStock     = existing.minStock;
        }
    }
});

const materialTypeError = computed(() => (submitted.value && !isEdit.value && !form.materialType ? t('inventory.material-type-required') : ''));
const unitError = computed(() => (submitted.value && !isEdit.value && !form.unit ? t('inventory.unit-required') : ''));
const stockError = computed(() => (submitted.value && !(form.quantity >= 0) ? t('inventory.stock-required') : ''));
const minError = computed(() => (submitted.value && !(form.minStock >= 0) ? t('inventory.min-required') : ''));

const valid = computed(() =>
    isEdit.value
        ? form.quantity >= 0 && form.minStock >= 0
        : form.materialType && form.unit && form.quantity >= 0 && form.minStock >= 0);

async function persist() {
    const result = await store.updateMaterial(route.params.id, { quantity: Number(form.quantity), minStock: Number(form.minStock) });
    if (result) router.push({ name: 'inventory-list' });
}

/** Validates and submits the material (create or update stock), then returns to the list. */
async function submit() {
    submitted.value = true;
    if (!valid.value) return;
    if (isEdit.value) {
        confirm.require({
            message: t('inventory.confirmSaveEdit', { id: route.params.id }),
            header: t('inventory.edit-title'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: t('common.save'),
            rejectLabel: t('common.cancel'),
            acceptClass: 'p-button-primary',
            rejectClass: 'p-button-outlined p-button-secondary',
            accept: persist
        });
        return;
    }
    const result = await store.addMaterial({
            materialType: form.materialType,
            unit:         form.unit,
            quantity:     Number(form.quantity),
            minStock:     Number(form.minStock)
        });
    if (result) router.push({ name: 'inventory-list' });
}

const cancel = () => router.push({ name: 'inventory-list' });
</script>

<template>
    <div class="p-4 flex justify-content-center">
        <div class="material-form__shell w-full">
            <pv-card>
                <template #title>{{ isEdit ? t('inventory.edit-title') : t('inventory.new-title') }}</template>
                <template #content>
                    <form class="p-fluid flex flex-column gap-3 mt-2" @submit.prevent="submit">
                        <div class="formgrid grid">
                            <div class="field col-12 md:col-6 mb-0">
                                <label for="materialType" class="block mb-1 font-medium">{{ t('inventory.material-type') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-input-text id="materialType" v-model="form.materialType" :disabled="isEdit"
                                               class="w-full" :class="{ 'p-invalid': materialTypeError }"
                                               :placeholder="t('inventory.material-type-placeholder')" />
                                <small v-if="materialTypeError" class="text-red-500">{{ materialTypeError }}</small>
                            </div>

                            <div class="field col-12 md:col-6 mb-0">
                                <label for="unit" class="block mb-1 font-medium">{{ t('inventory.unit') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-select id="unit" v-model="form.unit" :options="unitOptions" option-label="label" option-value="value"
                                           :disabled="isEdit" :placeholder="t('inventory.select-unit')" class="w-full"
                                           :class="{ 'p-invalid': unitError }" />
                                <small v-if="unitError" class="text-red-500">{{ unitError }}</small>
                            </div>
                        </div>

                        <div class="formgrid grid">
                            <div class="field col-12 md:col-6 mb-0">
                                <label for="quantity" class="block mb-1 font-medium">{{ t('inventory.stock') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-input-number id="quantity" v-model="form.quantity" :min="0" :max-fraction-digits="2" class="w-full"
                                                 :class="{ 'p-invalid': stockError }" :placeholder="t('inventory.stock-placeholder')" />
                                <small v-if="stockError" class="text-red-500">{{ stockError }}</small>
                            </div>

                            <div class="field col-12 md:col-6 mb-0">
                                <label for="minStock" class="block mb-1 font-medium">{{ t('inventory.min') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-input-number id="minStock" v-model="form.minStock" :min="0" :max-fraction-digits="2" class="w-full"
                                                 :class="{ 'p-invalid': minError }" :placeholder="t('inventory.min-placeholder')" />
                                <small v-if="minError" class="text-red-500">{{ minError }}</small>
                                <small v-else class="text-color-secondary">{{ t('inventory.min-hint') }}</small>
                            </div>
                        </div>

                        <div v-if="errors.length" class="text-red-500">
                            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
                        </div>

                        <small class="text-color-secondary">{{ t('common.required-fields') }}</small>

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
.material-form__shell {
    max-width: 40rem;
}
</style>
