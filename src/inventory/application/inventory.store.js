/**
 * Application service store for the `Inventory` bounded context.
 * It coordinates material use cases and keeps a UI-facing state.
 *
 * @module useInventoryStore
 * @returns {Object} Store state and actions.
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { InventoryApi } from '../infrastructure/inventory-api.js';
import { MaterialAssembler } from '../infrastructure/material.assembler.js';
import { Material } from '../domain/material.entity.js';

const inventoryApi = new InventoryApi();

const useInventoryStore = defineStore('inventory', () => {
    /** @type {import('vue').Ref<Array<import('../domain/material.entity.js').Material>>} List of material entities. */
    const materials = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Inventory use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Flag indicating if materials have been loaded. */
    const materialsLoaded = ref(false);
    /** @type {import('vue').ComputedRef<number>} Number of loaded materials. */
    const materialsCount = computed(() => materialsLoaded.value ? materials.value.length : 0);
    /** @type {import('vue').ComputedRef<Array<import('../domain/material.entity.js').Material>>} Materials at or below the configured minimum threshold. */
    const lowStockMaterials = computed(() =>
        materials.value.filter(material => material.stockQuantity <= material.minQuantity)
    );

    /**
     * Loads materials from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchMaterials() {
        inventoryApi.getMaterials().then(response => {
            materials.value = MaterialAssembler.toEntitiesFromResponse(response);
            materialsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds a material entity by identifier.
     * @param {number|string} id - Material identifier.
     * @returns {import('../domain/material.entity.js').Material|undefined} Matching material, if available.
     */
    function getMaterialById(id) {
        const idNum = parseInt(id);
        return materials.value.find(material => material.id === idNum);
    }

    /**
     * Creates a material through infrastructure and appends it to the local state.
     * @param {import('../domain/material.entity.js').Material} material - Material entity to persist.
     * @returns {void}
     */
    function addMaterial(material) {
        inventoryApi.createMaterial(material).then(response => {
            const newMaterial = MaterialAssembler.toEntityFromResource(response.data);
            materials.value.push(newMaterial);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing material and synchronizes local state.
     * @param {import('../domain/material.entity.js').Material} material - Material entity with updated data.
     * @returns {void}
     */
    function updateMaterial(material) {
        inventoryApi.updateMaterial(material).then(response => {
            const updatedMaterial = MaterialAssembler.toEntityFromResource(response.data);
            const index = materials.value.findIndex(m => m.id === updatedMaterial.id);
            if (index !== -1) materials.value[index] = updatedMaterial;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a material and removes it from the local state.
     * @param {import('../domain/material.entity.js').Material} material - Material entity to remove.
     * @returns {void}
     */
    function deleteMaterial(material) {
        inventoryApi.deleteMaterial(material.id).then(() => {
            const index = materials.value.findIndex(m => m.id === material.id);
            if (index !== -1) materials.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Adjusts the stock of a material by a signed delta (positive restocks, negative consumes).
     * @param {import('../domain/material.entity.js').Material} material - Material entity whose stock is being adjusted.
     * @param {number} delta - Signed quantity to apply.
     * @returns {void}
     */
    function adjustStock(material, delta) {
        const next = new Material({
            ...material,
            stockQuantity: Math.max(0, material.stockQuantity + delta)
        });
        updateMaterial(next);
    }

    /**
     * Returns true when the workshop has enough stock to fulfill the requested materials.
     * @param {Array<{materialId: number, quantity: number}>} requirements - Materials and quantities required.
     * @returns {boolean} Whether every requirement is satisfied by the current stock.
     */
    function hasStockFor(requirements) {
        return requirements.every(({ materialId, quantity }) => {
            const material = getMaterialById(materialId);
            return material ? material.stockQuantity >= quantity : false;
        });
    }

    return {
        materials,
        errors,
        materialsLoaded,
        materialsCount,
        lowStockMaterials,
        fetchMaterials,
        getMaterialById,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        adjustStock,
        hasStockFor
    };
});

export default useInventoryStore;
