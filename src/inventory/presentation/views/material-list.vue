<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { onMounted, toRefs } from 'vue';
import useInventoryStore from '../../application/inventory.store.js';

const { t }  = useI18n();
const router = useRouter();
const store  = useInventoryStore();
const { materials, materialsLoaded, lowStockMaterials, errors } = toRefs(store);
const { fetchMaterials, updateMaterial } = store;

onMounted(() => {
    if (!store.materialsLoaded) fetchMaterials();
});

const navigateToNew  = () => router.push({ name: 'inventory-material-new' });
const navigateToEdit = (id) => router.push({ name: 'inventory-material-edit', params: { id } });

/**
 * Quickly adjusts a material's stock by a signed delta via a PATCH.
 * @param {import('../../domain/material.entity.js').Material} material - Material to adjust.
 * @param {number} delta - Signed quantity to apply.
 */
const adjustStock = (material, delta) =>
    updateMaterial(material.id, { quantity: Math.max(0, material.quantity + delta), minStock: material.minStock });
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('inventory.title') }}</h1>
            <pv-button :label="t('inventory.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <div v-if="lowStockMaterials.length" class="inventory-list__alert p-3 mb-3 border-round">
            <div class="flex align-items-center gap-2">
                <i class="pi pi-exclamation-triangle" />
                <strong>{{ t('inventory.low-stock-alert', { count: lowStockMaterials.length }) }}</strong>
            </div>
        </div>

        <pv-data-table
            :value="materials"
            :loading="!materialsLoaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 50rem">
            <template #empty>
                <span class="text-color-secondary">{{ t('inventory.empty') }}</span>
            </template>
            <pv-column field="id" :header="t('inventory.id')" sortable />
            <pv-column field="materialType" :header="t('inventory.material-type')" sortable />
            <pv-column field="unit" :header="t('inventory.unit')" />
            <pv-column :header="t('inventory.stock')" sortable field="quantity">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <span>{{ data.quantity }} {{ data.unit }}</span>
                        <pv-tag v-if="data.isLowStock" :value="t('inventory.low')" severity="danger" />
                    </div>
                </template>
            </pv-column>
            <pv-column field="minStock" :header="t('inventory.min')" />
            <pv-column :header="t('inventory.actions')">
                <template #body="{ data }">
                    <pv-button icon="pi pi-plus" text rounded severity="success"
                               v-tooltip.top="t('inventory.actions-restock')" :aria-label="t('inventory.actions-restock')"
                               @click="adjustStock(data, 1)" />
                    <pv-button icon="pi pi-minus" text rounded severity="warn" :disabled="data.quantity <= 0"
                               v-tooltip.top="t('inventory.actions-consume')" :aria-label="t('inventory.actions-consume')"
                               @click="adjustStock(data, -1)" />
                    <pv-button icon="pi pi-pencil" text rounded
                               v-tooltip.top="t('inventory.actions-edit')" :aria-label="t('inventory.actions-edit')"
                               @click="navigateToEdit(data.id)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>

<style scoped>
.inventory-list__alert {
    background: var(--p-yellow-50);
    border: 1px solid var(--p-yellow-300);
}
</style>
