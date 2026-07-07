<script setup>
import AppSidebar from '../components/app-sidebar.vue';
import AppBreadcrumb from '../components/app-breadcrumb.vue';
import LanguageSwitcher from '../components/language-switcher.vue';
</script>

<template>
    <div class="min-h-screen surface-ground">
        <pv-confirm-dialog class="app-confirm-dialog" />
        <div class="grid min-h-screen m-0">
            <div class="col-12 md:col-fixed p-0 app-layout__sidebar-column">
                <AppSidebar />
            </div>

            <div class="col p-0 min-w-0">
                <header class="app-layout__header flex justify-content-between align-items-center gap-3 px-4 surface-card border-bottom-1 surface-border">
                    <AppBreadcrumb />
                    <LanguageSwitcher />
                </header>

                <main class="min-w-0">
                    <router-view />
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-layout__sidebar-column {
    width: 16rem;
}

.app-layout__header {
    position: sticky;
    top: 0;
    z-index: 10;
    min-height: 3.5rem;
}

@media (max-width: 960px) {
    .app-layout__sidebar-column {
        width: 100%;
    }
}
</style>
