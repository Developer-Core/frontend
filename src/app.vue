<script setup>
import { onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { setAppToast } from './shared/presentation/app-toast.js';
import { applyTheme, resolveInitialTheme } from './shared/presentation/theme.js';

const toast = useToast();
setAppToast(toast);

onMounted(() => {
  applyTheme(resolveInitialTheme());
});
</script>

<template>
  <router-view />
  <pv-toast />
</template>
