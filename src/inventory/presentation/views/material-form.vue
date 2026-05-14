<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, toRefs } from 'vue';
import useInventoryStore from '../../application/inventory.store.js';
import { Material } from '../../domain/material.entity.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const store = useInventoryStore();
const { errors } = toRefs(store);
const { fetchMaterials, getMaterialById, addMaterial, updateMaterial } = store;

const isEdit = computed(() => Boolean(route.params.id));

/**
 * Form model bound to the material being created or edited.
 * @type {import('vue').Ref<Material>}
 */
const material = ref(new Material({}));

/**
 * Available material categories surfaced by the type picker.
 * @type {Array<{label: string, value: string}>}
 */
const typeOptions = [
    { label: t('inventory.type-wood'),       value: 'wood' },
    { label: t('inventory.type-hardware'),   value: 'hardware' },
    { label: t('inventory.type-finish'),     value: 'finish' },
    { label: t('inventory.type-consumable'), value: 'consumable' }
];

/**
 * Available measurement units surfaced by the unit picker.
 * @type {Array<{label: string, value: string}>}
 */
const unitOptions = [
    { label: 'm',     value: 'm' },
    { label: 'm²',    value: 'm2' },
    { label: 'kg',    value: 'kg' },
    { label: 'l',     value: 'l' },
    { label: 'units', value: 'units' }
];

onMounted(() => {
    if (!store.materialsLoaded) fetchMaterials();
    if (isEdit.value) {
        const existing = getMaterialById(route.params.id);
        if (existing) material.value = new Material({ ...existing });
    }
});

/** Submit the form to either create or update the material, then navigate back to the list. */
const submit = () => {
    if (isEdit.value) updateMaterial(material.value);
    else              addMaterial(material.value);
    router.push({ name: 'inventory-list' });
};

/** Cancel the form and return to the list. */
const cancel = () => {
    router.push({ name: 'inventory-list' });
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">
            {{ isEdit ? t('inventory.edit-title') : t('inventory.new-title') }}
        </h1>

        <form @submit.prevent="submit" style="max-width: 40rem">
            <div class="field mb-3">
                <label for="name" class="block mb-1 font-medium">{{ t('inventory.name') }}</label>
                <pv-input-text id="name" v-model="material.name" required class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="type" class="block mb-1 font-medium">{{ t('inventory.type') }}</label>
                <pv-select
                    id="type"
                    v-model="material.type"
                    :options="typeOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('inventory.select-type')"
                    class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="unit" class="block mb-1 font-medium">{{ t('inventory.unit') }}</label>
                <pv-select
                    id="unit"
                    v-model="material.unit"
                    :options="unitOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('inventory.select-unit')"
                    class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="stockQuantity" class="block mb-1 font-medium">{{ t('inventory.stock') }}</label>
                <pv-input-number id="stockQuantity" v-model="material.stockQuantity" :min="0" :max-fraction-digits="2" :disabled="isEdit" class="w-full" />
                <small v-if="isEdit" class="text-color-secondary">{{ t('inventory.stock-hint-edit') }}</small>
            </div>

            <div class="field mb-3">
                <label for="minQuantity" class="block mb-1 font-medium">{{ t('inventory.min') }}</label>
                <pv-input-number id="minQuantity" v-model="material.minQuantity" :min="0" :max-fraction-digits="2" class="w-full" />
            </div>

            <div class="field mb-3">
                <label for="unitCost" class="block mb-1 font-medium">{{ t('inventory.unit-cost') }}</label>
                <pv-input-number id="unitCost" v-model="material.unitCost" :min="0" mode="currency" currency="PEN" locale="es-PE" class="w-full" />
            </div>

            <div class="flex gap-2 justify-content-end mt-4">
                <pv-button type="button" :label="t('common.cancel')" severity="secondary" text @click="cancel" />
                <pv-button type="submit" :label="t('common.save')"   icon="pi pi-check" />
            </div>
        </form>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
