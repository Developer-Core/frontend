<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

/** Navigate back to the application entry point. */
const goHome = () => router.push('/');
</script>

<template>
    <div class="not-found-page flex flex-column align-items-center justify-content-center p-4 text-center">
        <i class="pi pi-compass text-6xl text-color-secondary mb-4" />
        <h1 class="text-3xl font-semibold mb-2">{{ t('not-found.title') }}</h1>
        <p class="text-color-secondary mb-4">{{ t('not-found.message') }}</p>
        <pv-button :label="t('not-found.action')" icon="pi pi-home" @click="goHome" />
    </div>
</template>

<style scoped>
.not-found-page {
    min-height: 60vh;
}
</style>
