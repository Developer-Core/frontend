<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

/**
 * Home anchor rendered at the leftmost position of the breadcrumb.
 * @type {Object}
 */
const home = {
    icon: 'pi pi-home',
    command: () => router.push('/')
};

/**
 * Breadcrumb items derived from the matched routes hierarchy.
 * Only matched routes that declare a `meta.title` contribute a step;
 * consecutive duplicates are collapsed to avoid the section showing twice.
 * @type {import('vue').ComputedRef<Array<{label: string, command: Function}>>}
 */
const items = computed(() => {
    const seen = new Set();
    return route.matched
        .filter(record => record.meta?.title)
        .reduce((acc, record) => {
            const label = record.meta.title;
            if (seen.has(label)) return acc;
            seen.add(label);
            acc.push({
                label,
                command: () => {
                    if (record.name) router.push({ name: record.name, params: route.params });
                }
            });
            return acc;
        }, []);
});
</script>

<template>
    <pv-breadcrumb :model="items" :home="home" class="bg-transparent border-none p-0" />
</template>
