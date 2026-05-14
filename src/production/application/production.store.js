/**
 * Application service store for the `Production` bounded context.
 * It coordinates stage use cases and keeps a UI-facing state.
 *
 * @module useProductionStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ProductionApi } from '../infrastructure/production-api.js';
import { StageAssembler } from '../infrastructure/stage.assembler.js';
import { Stage } from '../domain/stage.entity.js';

const productionApi = new ProductionApi();

/**
 * Reactive store that exposes Production commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useProductionStore = defineStore('production', () => {
    /**
     * List of stage entities.
     * @type {import('vue').Ref<Stage[]>}
     */
    const stages = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether stages have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const stagesLoaded = ref(false);
    /**
     * Number of loaded stages.
     * @type {import('vue').ComputedRef<number>}
     */
    const stagesCount = computed(() => stagesLoaded.value ? stages.value.length : 0);

    /**
     * Loads stages from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchStages() {
        productionApi.getStages().then(response => {
            stages.value = StageAssembler.toEntitiesFromResponse(response);
            stagesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Returns the stages associated with a specific order, sorted by sequence.
     * @param {number|string} orderId - Order identifier.
     * @returns {Stage[]} Stages that belong to the order.
     */
    function getStagesByOrderId(orderId) {
        const idNum = parseInt(orderId);
        return stages.value
            .filter(stage => stage.orderId === idNum)
            .sort((a, b) => a.sequence - b.sequence);
    }

    /**
     * Finds a stage entity by identifier.
     * @param {number|string} id - Stage identifier.
     * @returns {Stage|undefined} Matching stage, if available.
     */
    function getStageById(id) {
        const idNum = parseInt(id);
        return stages.value.find(stage => stage.id === idNum);
    }

    /**
     * Creates a stage through infrastructure and appends it to the local state.
     * @param {Stage} stage - Stage entity to persist.
     * @returns {void}
     */
    function addStage(stage) {
        productionApi.createStage(stage).then(response => {
            const newStage = StageAssembler.toEntityFromResource(response.data);
            stages.value.push(newStage);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing stage and synchronizes local state.
     * @param {Stage} stage - Stage entity with updated data.
     * @returns {void}
     */
    function updateStage(stage) {
        productionApi.updateStage(stage).then(response => {
            const updatedStage = StageAssembler.toEntityFromResource(response.data);
            const index = stages.value.findIndex(s => s.id === updatedStage.id);
            if (index !== -1) stages.value[index] = updatedStage;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a stage and removes it from the local state.
     * @param {Stage} stage - Stage entity to remove.
     * @returns {void}
     */
    function deleteStage(stage) {
        productionApi.deleteStage(stage.id).then(() => {
            const index = stages.value.findIndex(s => s.id === stage.id);
            if (index !== -1) stages.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Advances a stage to a new status and records actual hours when provided.
     * @param {Stage} stage - Stage entity being advanced.
     * @param {('pending'|'in-progress'|'completed')} status - New stage status.
     * @param {number} [actualHours] - Hours actually spent on the stage so far.
     * @returns {void}
     */
    function changeStageStatus(stage, status, actualHours) {
        const next = new Stage({
            ...stage,
            status,
            actualHours: actualHours ?? stage.actualHours
        });
        updateStage(next);
    }

    return {
        stages,
        errors,
        stagesLoaded,
        stagesCount,
        fetchStages,
        getStagesByOrderId,
        getStageById,
        addStage,
        updateStage,
        deleteStage,
        changeStageStatus
    };
});

export default useProductionStore;
