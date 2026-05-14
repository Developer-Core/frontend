<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { onMounted, toRefs } from 'vue';
import useInventoryStore from '../../application/inventory.store.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();

const store = useInventoryStore();
const { materials, materialsLoaded, lowStockMaterials, errors } = toRefs(store);
const { fetchMaterials, deleteMaterial, adjustStock } = store;

onMounted(() => {
    if (!store.materialsLoaded) fetchMaterials();
});

/**
 * Determines whether a material is currently below the configured minimum.
 * @param {Object} material - Material entity to evaluate.
 * @returns {boolean} True when the stock has reached or fallen below the minimum.
 */
const isLowStock = (material) => material.stockQuantity <= material.minQuantity;

/** Navigate to the new material creation page. */
const navigateToNew = () => {
    router.push({ name: 'inventory-material-new' });
};

/**
 * Navigate to the material editing page.
 * @param {number} id - Material identifier.
 */
const navigateToEdit = (id) => {
    router.push({ name: 'inventory-material-edit', params: { id } });
};

/**
 * Confirm and delete a material.
 * @param {Object} material - Material entity to remove.
 */
const confirmDelete = (material) => {
    confirm.require({
        message: t('inventory.confirm-delete', { name: material.name }),
        header:  t('inventory.delete-header'),
        icon:    'pi pi-exclamation-triangle',
        accept:  () => deleteMaterial(material)
    });
};
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('inventory.title') }}</h1>
            <pv-button :label="t('inventory.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <div v-if="lowStockMaterials.length" class="p-3 mb-3 border-round" style="background: var(--p-yellow-50); border: 1px solid var(--p-yellow-300);">
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
            table-style="min-width: 60rem">
            <pv-column field="id"   :header="t('inventory.id')"   sortable />
            <pv-column field="name" :header="t('inventory.name')" sortable />
            <pv-column field="type" :header="t('inventory.type')">
                <template #body="slotProps">
                    {{ t(`inventory.type-${slotProps.data.type}`) }}
                </template>
            </pv-column>
            <pv-column field="unit"     :header="t('inventory.unit')" />
            <pv-column field="unitCost" :header="t('inventory.unit-cost')" />
            <pv-column :header="t('inventory.stock')" sortable>
                <template #body="slotProps">
                    <div class="flex align-items-center gap-2">
                        <span>{{ slotProps.data.stockQuantity }} {{ slotProps.data.unit }}</span>
                        <pv-tag v-if="isLowStock(slotProps.data)" :value="t('inventory.low')" severity="danger" />
                    </div>
                </template>
            </pv-column>
            <pv-column field="minQuantity" :header="t('inventory.min')" />
            <pv-column :header="t('inventory.actions')">
                <template #body="slotProps">
                    <pv-button
                        icon="pi pi-plus"
                        text rounded severity="success"
                        :aria-label="t('inventory.actions-restock')"
                        v-tooltip.top="t('inventory.actions-restock')"
                        @click="adjustStock(slotProps.data, 1)" />
                    <pv-button
                        icon="pi pi-minus"
                        text rounded severity="warn"
                        :disabled="slotProps.data.stockQuantity <= 0"
                        :aria-label="t('inventory.actions-consume')"
                        v-tooltip.top="t('inventory.actions-consume')"
                        @click="adjustStock(slotProps.data, -1)" />
                    <pv-button
                        icon="pi pi-pencil"
                        text rounded
                        :aria-label="t('inventory.actions-edit')"
                        v-tooltip.top="t('inventory.actions-edit')"
                        @click="navigateToEdit(slotProps.data.id)" />
                    <pv-button
                        icon="pi pi-trash"
                        text rounded severity="danger"
                        :aria-label="t('inventory.actions-delete')"
                        v-tooltip.top="t('inventory.actions-delete')"
                        @click="confirmDelete(slotProps.data)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>

        <pv-confirm-dialog />
    </div>
</template>
