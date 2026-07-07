<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { applyTheme, resolveInitialTheme } from '../theme.js';

const { t } = useI18n();
const isDark = ref(false);

/**
 * Toggles the theme between light and dark mode,
 * updating both DOM classes and localStorage settings.
 */
const toggleTheme = () => {
    isDark.value = applyTheme(isDark.value ? 'light' : 'dark');
};

onMounted(() => {
    isDark.value = applyTheme(resolveInitialTheme());
});
</script>

<template>
    <pv-button
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        severity="secondary"
        text
        rounded
        @click="toggleTheme"
        v-tooltip.bottom="isDark ? t('shell.theme-light') : t('shell.theme-dark')"
        :aria-label="isDark ? t('shell.theme-light') : t('shell.theme-dark')"
        class="theme-toggle" />
</template>

<style scoped>
.theme-toggle {
    width: 2.5rem;
    height: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

:deep(.p-button-icon) {
    font-size: 1.15rem;
    transition: transform 0.3s ease;
}

.p-button:hover :deep(.p-button-icon) {
    transform: rotate(15deg) scale(1.1);
}
</style>
