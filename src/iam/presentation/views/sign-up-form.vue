<script setup>
import { reactive, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useIamStore from '../../application/iam.store.js';
import { SignUpCommand } from '../../domain/sign-up.command.js';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
import ThemeToggle from '../../../shared/presentation/components/theme-toggle.vue';
import BrandLogo from '../../../shared/presentation/components/brand-logo.vue';

const { t }  = useI18n();
const router = useRouter();
const store  = useIamStore();

// Public registration is Client-only: carpenters onboard through the closed,
// invitation-gated flow at /register-carpenter. Backend EUserRole is serialized
// as an integer (Carpenter = 0, Client = 1) and is additionally forced to Client
// server-side for this endpoint.
const CLIENT_ROLE = 1;

const form      = reactive({ firstName: '', lastName: '', email: '', password: '', role: CLIENT_ROLE });
const submitted = ref(false);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const firstNameError = computed(() => (submitted.value && !form.firstName ? t('iam.first-name-required') : ''));
const lastNameError  = computed(() => (submitted.value && !form.lastName ? t('iam.last-name-required') : ''));
const emailError = computed(() => {
    if (!submitted.value) return '';
    if (!form.email) return t('iam.email-required');
    if (!emailPattern.test(form.email)) return t('iam.email-invalid');
    return '';
});
const passwordError = computed(() => (submitted.value && !form.password ? t('iam.password-required') : ''));
const showAuthError = computed(() => submitted.value && store.errors.length > 0);

/** Validates the form and, when valid, delegates the sign-up to the store. */
function performSignUp() {
    submitted.value = true;
    store.errors = [];
    if (firstNameError.value || lastNameError.value || emailError.value || passwordError.value) return;
    store.signUp(new SignUpCommand(form), router);
}
</script>

<template>
    <div class="auth-screen flex align-items-center justify-content-center p-4">
        <div class="auth-shell w-full">
            <div class="auth-shell__toolbar flex justify-content-end mb-4">
                <div class="flex align-items-center gap-2">
                    <ThemeToggle />
                    <language-switcher />
                </div>
            </div>

            <pv-card class="auth-card w-full">
            <template #header>
                <div class="auth-brand-header px-4 pt-4">
                    <BrandLogo class="auth-brand-logo" />
                    <small class="auth-brand-tagline">{{ t('iam.tagline') }}</small>
                </div>
            </template>

            <template #title>{{ t('iam.register-title') }}</template>
            <template #subtitle>{{ t('iam.register-subtitle') }}</template>

            <template #content>
                <form class="flex flex-column gap-3 mt-2" novalidate @submit.prevent="performSignUp">
                    <div class="flex gap-3">
                        <div class="field flex-1">
                            <label for="firstName" class="block mb-1 font-medium">{{ t('iam.first-name') }}</label>
                            <pv-input-text id="firstName" v-model.trim="form.firstName" class="w-full"
                                           :class="{ 'p-invalid': firstNameError }" :placeholder="t('iam.first-name')" />
                            <small v-if="firstNameError" class="text-red-500">{{ firstNameError }}</small>
                        </div>
                        <div class="field flex-1">
                            <label for="lastName" class="block mb-1 font-medium">{{ t('iam.last-name') }}</label>
                            <pv-input-text id="lastName" v-model.trim="form.lastName" class="w-full"
                                           :class="{ 'p-invalid': lastNameError }" :placeholder="t('iam.last-name')" />
                            <small v-if="lastNameError" class="text-red-500">{{ lastNameError }}</small>
                        </div>
                    </div>

                    <div class="field">
                        <label for="email" class="block mb-1 font-medium">{{ t('iam.email') }}</label>
                        <pv-icon-field>
                            <pv-input-icon class="pi pi-envelope" />
                            <pv-input-text id="email" v-model.trim="form.email" type="email"
                                           class="w-full" :class="{ 'p-invalid': emailError }"
                                           :placeholder="t('iam.email')" autocomplete="email" />
                        </pv-icon-field>
                        <small v-if="emailError" class="text-red-500">{{ emailError }}</small>
                    </div>

                    <div class="field">
                        <label for="password" class="block mb-1 font-medium">{{ t('iam.password') }}</label>
                        <pv-icon-field>
                            <pv-input-icon class="pi pi-lock" />
                            <pv-input-text id="password" v-model="form.password" type="password"
                                           class="w-full" :class="{ 'p-invalid': passwordError }"
                                           :placeholder="t('iam.password')" autocomplete="new-password" />
                        </pv-icon-field>
                        <small v-if="passwordError" class="text-red-500">{{ passwordError }}</small>
                    </div>

                    <div v-if="showAuthError" class="auth-error flex align-items-center gap-2 mt-1">
                        <i class="pi pi-exclamation-circle" />
                        <span>{{ t('iam.register-failed') }}</span>
                    </div>

                    <pv-button type="submit" :label="t('iam.sign-up')" icon="pi pi-user-plus" class="w-full mt-2" />

                    <div class="text-center text-sm mt-2">
                        <span class="text-color-secondary">{{ t('iam.have-account') }}</span>
                        <router-link :to="{ name: 'login' }" class="text-primary no-underline ml-1 font-medium">{{ t('iam.go-login') }}</router-link>
                    </div>
                    <div class="text-center text-sm">
                        <span class="text-color-secondary">{{ t('iam.are-you-carpenter') }}</span>
                        <router-link :to="{ name: 'register-carpenter' }" class="text-primary no-underline ml-1 font-medium">{{ t('iam.go-register-carpenter') }}</router-link>
                    </div>
                    <div class="text-center text-sm">
                        <span class="text-color-secondary">{{ t('iam.track-without-account') }}</span>
                        <router-link :to="{ name: 'landing' }" class="text-primary no-underline ml-1 font-medium">
                            {{ t('iam.go-track-public') }}
                        </router-link>
                    </div>
                </form>
            </template>
            </pv-card>
        </div>
    </div>
</template>

<style scoped>
.auth-screen {
    min-height: 100vh;
    background:
        radial-gradient(1200px 600px at 100% 0%, var(--p-primary-100) 0%, transparent 55%),
        var(--p-surface-50);
}

.auth-shell {
    max-width: 26rem;
}

.auth-card {
    border: 1px solid var(--p-surface-200);
    box-shadow: 0 10px 30px rgba(67, 15, 5, 0.08);
}

.auth-brand-logo {
    width: min(12rem, 100%);
    height: auto;
}

.auth-brand-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
}

.auth-brand-tagline {
    display: block;
    color: var(--p-text-muted-color);
    line-height: 1.4;
}

.auth-error {
    color: var(--p-red-600);
    background: var(--p-red-50);
    border: 1px solid var(--p-red-200);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
}

:global(.app-dark) .auth-brand-tagline {
    color: var(--color-secondary-foreground);
}
</style>
