/**
 * Application service store for the Inventory bounded context. It coordinates the
 * material use cases (register, update stock, consult) and keeps a UI-facing state.
 *
 * @module useInventoryStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { InventoryApi } from '../infrastructure/inventory-api.js';
import { MaterialAssembler } from '../infrastructure/material.assembler.js';
import { notifySuccess, notifyError } from '../../shared/presentation/app-toast.js';

const inventoryApi = new InventoryApi();

const useInventoryStore = defineStore('inventory', () => {
    /** @type {import('vue').Ref<Array<import('../domain/material.entity.js').Material>>} Loaded materials. */
    const materials = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Inventory use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether materials have been loaded at least once. */
    const materialsLoaded = ref(false);

    const materialsCount    = computed(() => (materialsLoaded.value ? materials.value.length : 0));
    const lowStockMaterials = computed(() => materials.value.filter(m => m.isLowStock));

    /** Loads materials from infrastructure. @returns {Promise<void>} */
    function fetchMaterials() {
        return inventoryApi.getMaterials()
            .then(response => {
                materials.value = MaterialAssembler.toEntitiesFromResponse(response);
                materialsLoaded.value = true;
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /** Finds a loaded material by id. @param {number|string} id @returns {import('../domain/material.entity.js').Material|undefined} */
    function getMaterialById(id) {
        const idNum = parseInt(id, 10);
        return materials.value.find(m => m.id === idNum);
    }

    /** Replaces (or appends) a material in local state by id. @param {import('../domain/material.entity.js').Material} material */
    function upsert(material) {
        const index = materials.value.findIndex(m => m.id === material.id);
        if (index !== -1) materials.value[index] = material;
        else materials.value.push(material);
    }

    /**
     * Registers a material.
     * @param {Object} resource - { materialType, quantity, unit, minStock }.
     * @returns {Promise<?import('../domain/material.entity.js').Material>}
     */
    function addMaterial(resource) {
        return inventoryApi.createMaterial(resource)
            .then(response => { const m = MaterialAssembler.toEntityFromResource(response.data); upsert(m); notifySuccess('toast.material-created'); return m; })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); return null; });
    }

    /**
     * Updates the stock levels of a material.
     * @param {number|string} id - Material identifier.
     * @param {{ quantity: number, minStock: number }} resource - Stock payload.
     * @returns {Promise<?import('../domain/material.entity.js').Material>}
     */
    function updateMaterial(id, resource) {
        return inventoryApi.updateMaterial(id, resource)
            .then(response => { const m = MaterialAssembler.toEntityFromResource(response.data); upsert(m); notifySuccess('toast.material-updated'); return m; })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); return null; });
    }

    return {
        materials, errors, materialsLoaded, materialsCount, lowStockMaterials,
        fetchMaterials, getMaterialById, addMaterial, updateMaterial
    };
});

export default useInventoryStore;
