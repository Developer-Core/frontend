<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref, toRefs } from 'vue';
import { useConfirm } from 'primevue';
import useCustomersStore from '../../application/customers.store.js';

const { t }    = useI18n();
const route    = useRoute();
const router   = useRouter();
const confirm  = useConfirm();
const store    = useCustomersStore();
const { errors } = toRefs(store);

const isEdit    = computed(() => Boolean(route.params.id));
const submitted = ref(false);

/** Flat form model matching the backend Create/Update customer resources. */
const form = reactive({ firstName: '', lastName: '', email: '', phone: '' });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

onMounted(async () => {
    if (isEdit.value) {
        if (!store.customersLoaded) await store.fetchCustomers();
        const existing = store.customerById(route.params.id);
        if (existing) {
            form.firstName = existing.firstName;
            form.lastName  = existing.lastName;
            form.email     = existing.email;
            form.phone     = existing.phone;
        }
    }
});

const firstNameError = computed(() => (submitted.value && !form.firstName ? t('customers.first-name-required') : ''));
const lastNameError  = computed(() => (submitted.value && !form.lastName ? t('customers.last-name-required') : ''));
const emailError = computed(() => {
    if (!submitted.value) return '';
    if (!form.email) return t('customers.email-required');
    if (!emailPattern.test(form.email)) return t('customers.email-invalid');
    return '';
});
const phoneError = computed(() => (submitted.value && !form.phone ? t('customers.phone-required') : ''));

const valid = computed(() => form.firstName && form.lastName && form.email && emailPattern.test(form.email) && form.phone);

async function persist() {
    const result = await store.updateCustomer(route.params.id, {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone
    });
    if (result) router.push({ name: 'customers-list' });
}

/** Validates and submits the customer (create or update), then returns to the list. */
async function submit() {
    submitted.value = true;
    if (!valid.value) return;
    if (isEdit.value) {
        confirm.require({
            message: t('customers.confirmSaveEdit', { id: route.params.id }),
            header: t('customers.edit-title'),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: t('common.save'),
            rejectLabel: t('common.cancel'),
            acceptClass: 'p-button-primary',
            rejectClass: 'p-button-outlined p-button-secondary',
            accept: persist
        });
        return;
    }
    const result = await store.createCustomer({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone
    });
    if (!result) return;
    if (route.query.returnTo === 'order') {
        router.push({ name: 'orders-new', query: { customerId: result.id } });
    } else {
        router.push({ name: 'customers-list' });
    }
}

const cancel = () => router.push({ name: 'customers-list' });
</script>

<template>
    <div class="p-4 flex justify-content-center">
        <div class="customer-form__shell w-full">
            <pv-card>
                <template #title>{{ isEdit ? t('customers.edit-title') : t('customers.new-title') }}</template>
                <template #content>
                    <form class="p-fluid flex flex-column gap-3 mt-2" @submit.prevent="submit">
                        <div class="formgrid grid">
                            <div class="field col-12 md:col-6 mb-0">
                                <label for="firstName" class="block mb-1 font-medium">{{ t('customers.first-name') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-input-text id="firstName" v-model.trim="form.firstName"
                                               class="w-full" :class="{ 'p-invalid': firstNameError }"
                                               :placeholder="t('customers.first-name-placeholder')" />
                                <small v-if="firstNameError" class="text-red-500">{{ firstNameError }}</small>
                            </div>

                            <div class="field col-12 md:col-6 mb-0">
                                <label for="lastName" class="block mb-1 font-medium">{{ t('customers.last-name') }} <span class="text-red-500 ml-1">*</span></label>
                                <pv-input-text id="lastName" v-model.trim="form.lastName"
                                               class="w-full" :class="{ 'p-invalid': lastNameError }"
                                               :placeholder="t('customers.last-name-placeholder')" />
                                <small v-if="lastNameError" class="text-red-500">{{ lastNameError }}</small>
                            </div>
                        </div>

                        <div class="field">
                            <label for="email" class="block mb-1 font-medium">{{ t('customers.email') }} <span class="text-red-500 ml-1">*</span></label>
                            <pv-input-text id="email" v-model.trim="form.email" type="email"
                                           class="w-full" :class="{ 'p-invalid': emailError }"
                                           :placeholder="t('customers.email-placeholder')" />
                            <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
                        </div>

                        <div class="field">
                            <label for="phone" class="block mb-1 font-medium">{{ t('customers.phone') }} <span class="text-red-500 ml-1">*</span></label>
                            <pv-input-text id="phone" v-model.trim="form.phone" class="w-full" :class="{ 'p-invalid': phoneError }"
                                           :placeholder="t('customers.phone-placeholder')" />
                            <small v-if="phoneError" class="text-red-500">{{ phoneError }}</small>
                            <small v-else class="text-color-secondary">{{ t('customers.phone-hint') }}</small>
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
.customer-form__shell {
    max-width: 40rem;
}
</style>
