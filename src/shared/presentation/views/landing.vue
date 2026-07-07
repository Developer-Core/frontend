<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from '../components/language-switcher.vue';
import ThemeToggle from '../components/theme-toggle.vue';
import BrandLogo from '../components/brand-logo.vue';

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
    <div class="landing min-h-screen flex flex-column align-items-center justify-content-center p-4">
        <div class="landing__toolbar w-full flex justify-content-end mb-4">
            <div class="flex align-items-center gap-2">
                <ThemeToggle />
                <language-switcher />
            </div>
        </div>

        <div class="landing__inner w-full flex flex-column align-items-center">
            <BrandLogo class="landing__brand-logo mb-4" />

            <h1 class="landing__title text-4xl font-bold text-center m-0">{{ t('landing.title') }}</h1>
            <p class="landing__copy text-color-secondary text-center mt-2 mb-5">
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
                <router-link :to="{ name: 'login' }" class="landing__login text-primary no-underline font-medium">
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
    background:
        radial-gradient(1200px 600px at 100% 0%, var(--p-primary-100) 0%, transparent 55%),
        radial-gradient(1000px 500px at 0% 100%, var(--p-primary-50) 0%, transparent 55%),
        var(--p-surface-50);
}

.landing__inner {
    max-width: 40rem;
}

.landing__toolbar {
    max-width: 40rem;
}

.landing__brand-logo {
    width: min(15rem, 72vw);
    height: auto;
}

.landing__copy {
    max-width: 34rem;
}

.landing__card {
    max-width: 34rem;
    border: 1px solid var(--p-surface-200);
    box-shadow: 0 10px 30px rgba(67, 15, 5, 0.08);
}

.landing__login {
    transition: color 150ms ease;
}

.landing__login:hover {
    color: var(--p-primary-hover-color, var(--p-primary-color));
}

:global(.app-dark) .landing__title {
    color: var(--color-foreground);
}

:global(.app-dark) .landing__copy {
    color: var(--color-secondary-foreground) !important;
}
</style>
