<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { onMounted, toRefs } from 'vue';
import useCustomersStore from '../../application/customers.store.js';

const { t }  = useI18n();
const router = useRouter();
const store  = useCustomersStore();
const { customers, customersLoaded, errors } = toRefs(store);
const { fetchCustomers } = store;

onMounted(() => {
    if (!store.customersLoaded) fetchCustomers();
});

const navigateToNew  = () => router.push({ name: 'customers-new' });
const navigateToEdit = (id) => router.push({ name: 'customers-edit', params: { id } });
</script>

<template>
    <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-3">
            <h1 class="text-2xl font-semibold">{{ t('customers.title') }}</h1>
            <pv-button :label="t('customers.new')" icon="pi pi-plus" @click="navigateToNew" />
        </div>

        <pv-data-table
            :value="customers"
            :loading="!customersLoaded"
            striped-rows
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            table-style="min-width: 50rem">
            <template #empty>
                <span class="text-color-secondary">{{ t('customers.empty') }}</span>
            </template>
            <pv-column field="id" :header="t('customers.id')" sortable />
            <pv-column field="fullName" :header="t('customers.name')" sortable>
                <template #body="{ data }">
                    <span>{{ data.fullName || `${data.firstName} ${data.lastName}`.trim() }}</span>
                </template>
            </pv-column>
            <pv-column field="email" :header="t('customers.email')" sortable />
            <pv-column field="phone" :header="t('customers.phone')" />
            <pv-column :header="t('customers.actions')">
                <template #body="{ data }">
                    <pv-button icon="pi pi-pencil" text rounded
                               v-tooltip.top="t('customers.actions-edit')" :aria-label="t('customers.actions-edit')"
                               @click="navigateToEdit(data.id)" />
                </template>
            </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
