<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isDark = ref(false);

/**
 * Toggles the theme between light and dark mode,
 * updating both DOM classes and localStorage settings.
 */
const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
        document.documentElement.classList.add('app-dark');
        localStorage.setItem('woodroute.theme', 'dark');
    } else {
        document.documentElement.classList.remove('app-dark');
        localStorage.setItem('woodroute.theme', 'light');
    }
};

onMounted(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('woodroute.theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true;
        document.documentElement.classList.add('app-dark');
    } else {
        isDark.value = false;
        document.documentElement.classList.remove('app-dark');
    }
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
        style="width: 2.5rem; height: 2.5rem; display: inline-flex; align-items: center; justify-content: center;" />
</template>

<style scoped>
:deep(.p-button-icon) {
    font-size: 1.15rem;
    transition: transform 0.3s ease;
}

.p-button:hover :deep(.p-button-icon) {
    transform: rotate(15deg) scale(1.1);
}
</style>
