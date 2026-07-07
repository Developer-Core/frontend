<script setup>
import { useToast } from 'primevue/usetoast';
import { setAppToast } from './shared/presentation/app-toast.js';

const toast = useToast();
setAppToast(toast);
</script>

<template>
  <router-view />
  <pv-toast />
</template>
