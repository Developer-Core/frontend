<script setup>
import AppSidebar from '../components/app-sidebar.vue';
import AppBreadcrumb from '../components/app-breadcrumb.vue';
import LanguageSwitcher from '../components/language-switcher.vue';
import ThemeToggle from '../components/theme-toggle.vue';
</script>

<template>
    <div style="min-height: 100vh; background: var(--surface-canvas);">
        <pv-confirm-dialog class="app-confirm-dialog" />
        <AppSidebar />

        <div style="margin-left: 16rem;">
            <header
                class="flex justify-content-between align-items-center px-4 gap-3"
                style="height: 3.5rem; background: var(--surface-card); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 10;">
                <AppBreadcrumb />
                <div class="flex align-items-center gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </header>

            <main>
                <router-view />
            </main>
        </div>
    </div>
</template>
