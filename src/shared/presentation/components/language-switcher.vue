<script setup>
import { useI18n } from 'vue-i18n';
import { computed, watch } from 'vue';
import { STORAGE_KEY, SUPPORTED } from '../../../i18n.js';

const { t, locale } = useI18n();

/**
 * Locale options surfaced by the picker.
 * @type {import('vue').ComputedRef<Array<{label: string, value: string}>>}
 */
const options = computed(() => SUPPORTED.map(code => ({
    label: t(`shell.language-${code}`),
    value: code
})));

watch(locale, (next) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
});
</script>

<template>
    <pv-select
        v-model="locale"
        :options="options"
        option-label="label"
        option-value="value"
        :aria-label="t('shell.language-label')"
        v-tooltip.bottom="t('shell.language-label')"
        style="min-width: 8rem" />
</template>
