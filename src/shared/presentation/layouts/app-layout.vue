<script setup>
import AppSidebar from '../components/app-sidebar.vue';
import AppBreadcrumb from '../components/app-breadcrumb.vue';
import LanguageSwitcher from '../components/language-switcher.vue';
</script>

<template>
    <div style="min-height: 100vh; background: var(--p-surface-50);">
        <AppSidebar />

        <div style="margin-left: 16rem;">
            <header
                class="flex justify-content-between align-items-center px-4 gap-3"
                style="height: 3.5rem; background: var(--p-surface-0); border-bottom: 1px solid var(--p-surface-200); position: sticky; top: 0; z-index: 10;">
                <AppBreadcrumb />
                <LanguageSwitcher />
            </header>

            <main>
                <router-view />
            </main>
        </div>
    </div>
</template>
