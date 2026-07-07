/**
 * Application service store for the Production (Manufacturing) bounded context.
 * Stages belong to a single order, so the store holds the stages of the order
 * currently being viewed and coordinates the define / advance use cases.
 *
 * @module useProductionStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ProductionApi } from '../infrastructure/production-api.js';
import { StageAssembler } from '../infrastructure/stage.assembler.js';
import { StageStatus } from '../domain/stage-status.js';

const productionApi = new ProductionApi();

const useProductionStore = defineStore('production', () => {
    /** @type {import('vue').Ref<Array<import('../domain/stage.entity.js').Stage>>} Stages of the current order. */
    const stages = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Production use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether stages have been loaded for the current order. */
    const stagesLoaded = ref(false);

    const stagesCount = computed(() => stages.value.length);
    /** @type {import('vue').ComputedRef<number>} Percentage of completed stages (0-100). */
    const completedPercent = computed(() => {
        if (stages.value.length === 0) return 0;
        const done = stages.value.filter(s => s.status === StageStatus.COMPLETED).length;
        return Math.round((done / stages.value.length) * 100);
    });

    /**
     * Loads the production stages of an order.
     * @param {number|string} orderId - Order identifier.
     * @returns {Promise<void>}
     */
    function fetchStages(orderId) {
        stagesLoaded.value = false;
        return productionApi.getStages(orderId)
            .then(response => {
                stages.value = StageAssembler.toEntitiesFromResponse(response);
                stagesLoaded.value = true;
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /**
     * Compatibility helper: returns the stages currently loaded (already scoped to one order).
     * @returns {Array<import('../domain/stage.entity.js').Stage>} Loaded stages.
     */
    function getStagesByOrderId() {
        return stages.value;
    }

    /**
     * Defines the ordered production stages for an accepted order. The acting
     * carpenter is derived from the JWT server-side, so it is never sent from here.
     * @param {number|string} orderId - Order identifier.
     * @param {Array<{ name: string, estimatedTimeInDays: number }>} stageList - Ordered stages.
     * @returns {Promise<?Array>}
     */
    function defineStages(orderId, stageList) {
        return productionApi.defineStages(orderId, { stages: stageList })
            .then(response => {
                stages.value = StageAssembler.toEntitiesFromResponse(response);
                stagesLoaded.value = true;
                return stages.value;
            })
            .catch(error => { errors.value.push(error); return null; });
    }

    /**
     * Advances a stage to a new status (carpenter action). The acting carpenter is
     * derived from the JWT server-side, so it is never sent from here.
     * @param {number|string} orderId - Order identifier.
     * @param {number|string} stageId - Stage identifier.
     * @param {string} status - New status (Pending | InProgress | Completed).
     * @returns {Promise<void>}
     */
    function updateStageStatus(orderId, stageId, status) {
        return productionApi.updateStageStatus(orderId, stageId, { status })
            .then(response => {
                const updated = StageAssembler.toEntityFromResource(response.data);
                const index = stages.value.findIndex(s => s.id === updated.id);
                if (index !== -1) stages.value[index] = updated;
            })
            .catch(error => { errors.value.push(error); });
    }

    return {
        stages,
        errors,
        stagesLoaded,
        stagesCount,
        completedPercent,
        fetchStages,
        getStagesByOrderId,
        defineStages,
        updateStageStatus
    };
});

export default useProductionStore;
