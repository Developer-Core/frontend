/**
 * Application service store for the Customers bounded context. It coordinates the
 * customer use cases (list, register, update) and keeps a UI-facing state.
 *
 * @module useCustomersStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { CustomersApi } from '../infrastructure/customers-api.js';
import { CustomerAssembler } from '../infrastructure/customer.assembler.js';
import { notifySuccess, notifyError } from '../../shared/presentation/app-toast.js';

const customersApi = new CustomersApi();

const useCustomersStore = defineStore('customers', () => {
    /** @type {import('vue').Ref<Array<import('../domain/customer.entity.js').Customer>>} Loaded customers. */
    const customers = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Customers use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Whether customers have been loaded at least once. */
    const customersLoaded = ref(false);

    const customersCount = computed(() => (customersLoaded.value ? customers.value.length : 0));

    /** Replaces (or appends) a customer in local state by id. @param {import('../domain/customer.entity.js').Customer} customer */
    function upsert(customer) {
        const index = customers.value.findIndex(c => c.id === customer.id);
        if (index !== -1) customers.value[index] = customer;
        else customers.value.push(customer);
    }

    /** Loads customers from infrastructure. @returns {Promise<void>} */
    function fetchCustomers() {
        return customersApi.getAll()
            .then(response => {
                customers.value = CustomerAssembler.toEntitiesFromResponse(response);
                customersLoaded.value = true;
                errors.value = [];
            })
            .catch(error => { errors.value.push(error); });
    }

    /** Finds a loaded customer by id. @param {number|string} id @returns {import('../domain/customer.entity.js').Customer|undefined} */
    function customerById(id) {
        const idNum = parseInt(id, 10);
        return customers.value.find(c => c.id === idNum);
    }

    /**
     * Registers a customer.
     * @param {Object} cmd - { firstName, lastName, email, phone, userId? }.
     * @returns {Promise<?import('../domain/customer.entity.js').Customer>}
     */
    function createCustomer(cmd) {
        return customersApi.create(cmd)
            .then(response => { const c = CustomerAssembler.toEntityFromResource(response.data); upsert(c); notifySuccess('toast.customer-created'); return c; })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); return null; });
    }

    /**
     * Updates a customer.
     * @param {number|string} id - Customer identifier.
     * @param {Object} cmd - { firstName, lastName, email, phone }.
     * @returns {Promise<?import('../domain/customer.entity.js').Customer>}
     */
    function updateCustomer(id, cmd) {
        return customersApi.update(id, cmd)
            .then(response => { const c = CustomerAssembler.toEntityFromResource(response.data); upsert(c); notifySuccess('toast.customer-updated'); return c; })
            .catch(error => { errors.value.push(error); notifyError('toast.action-failed'); return null; });
    }

    return {
        customers, errors, customersLoaded, customersCount,
        fetchCustomers, customerById, createCustomer, updateCustomer
    };
});

export default useCustomersStore;
