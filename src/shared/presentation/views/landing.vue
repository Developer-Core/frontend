<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t }  = useI18n();
const router = useRouter();

const code = ref('');

/** Navigates to the public tracking page for the typed code. */
function track() {
    const value = code.value.trim();
    if (!value) return;
    router.push({ name: 'public-tracking', params: { id: value } });
}
</script>

<template>
    <div class="landing flex flex-column align-items-center justify-content-center p-4">
        <div class="landing__inner w-full flex flex-column align-items-center">
            <span class="brand-badge flex align-items-center justify-content-center mb-4">
                <i class="pi pi-box text-2xl" />
            </span>

            <h1 class="text-4xl font-bold text-center m-0">{{ t('landing.title') }}</h1>
            <p class="text-color-secondary text-center mt-2 mb-5" style="max-width: 34rem;">
                {{ t('landing.subtitle') }}
            </p>

            <pv-card class="landing__card w-full">
                <template #content>
                    <label for="tracking-code" class="block mb-2 font-medium">{{ t('landing.track-label') }}</label>
                    <form class="flex gap-2" @submit.prevent="track">
                        <pv-icon-field class="flex-1">
                            <pv-input-icon class="pi pi-hashtag" />
                            <pv-input-text id="tracking-code" v-model.trim="code" class="w-full"
                                           :placeholder="t('landing.track-placeholder')" />
                        </pv-icon-field>
                        <pv-button type="submit" icon="pi pi-search" :label="t('landing.track-button')" :disabled="!code" />
                    </form>
                    <small class="block text-color-secondary mt-2">{{ t('landing.track-hint') }}</small>
                </template>
            </pv-card>

            <div class="text-center mt-5">
                <router-link :to="{ name: 'login' }" class="landing__login no-underline font-medium">
                    <i class="pi pi-sign-in mr-1" />
                    {{ t('landing.workshop-access') }}
                </router-link>
            </div>
        </div>

        <footer class="text-center text-color-secondary mt-6">
            <small>{{ t('shell.footer') }}</small>
        </footer>
    </div>
</template>

<style scoped>
.landing {
    min-height: 100vh;
    background:
        radial-gradient(1200px 600px at 100% 0%, var(--p-primary-100) 0%, transparent 55%),
        radial-gradient(1000px 500px at 0% 100%, var(--p-primary-50) 0%, transparent 55%),
        var(--p-surface-50);
}

.landing__inner {
    max-width: 40rem;
}

.brand-badge {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 1rem;
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
    box-shadow: 0 10px 30px rgba(67, 15, 5, 0.18);
}

.landing__card {
    max-width: 34rem;
    border: 1px solid var(--p-surface-200);
    box-shadow: 0 10px 30px rgba(67, 15, 5, 0.08);
}

.landing__login {
    color: var(--p-text-color-secondary, var(--p-text-color));
    transition: color 150ms ease;
}

.landing__login:hover {
    color: var(--p-primary-color);
}
</style>
