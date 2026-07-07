<script setup>
import { onBeforeUnmount, onMounted, ref, useAttrs } from 'vue';

const attrs = useAttrs();
const isDark = ref(false);

let observer;

const syncTheme = () => {
    isDark.value = document.documentElement.classList.contains('app-dark');
};

onMounted(() => {
    syncTheme();
    observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onBeforeUnmount(() => {
    observer?.disconnect();
});
</script>

<template>
    <img
        v-bind="attrs"
        :src="isDark ? '/brand/logo-woodroute-dark.png' : '/brand/logo-woodroute.png'"
        :alt="attrs.alt || 'WoodRoute'" />
</template>
