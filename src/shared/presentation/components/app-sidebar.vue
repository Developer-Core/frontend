<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import AccountSummary from './account-summary.vue';

const { t } = useI18n();
const route = useRoute();

/**
 * Navigation items rendered in the sidebar.
 * Each entry maps to a top-level bounded-context section.
 * @type {import('vue').ComputedRef<Array<{label: string, icon: string, to: string, match: string}>>}
 */
const navItems = computed(() => [
    { label: t('shell.nav-orders'),        icon: 'pi pi-receipt',    to: '/orders',        match: '/orders' },
    { label: t('shell.nav-production'),    icon: 'pi pi-calendar',   to: '/production',    match: '/production' },
    { label: t('shell.nav-inventory'),     icon: 'pi pi-box',        to: '/inventory',     match: '/inventory' },
    { label: t('shell.nav-quotes'),        icon: 'pi pi-calculator', to: '/quotes',        match: '/quotes' },
    { label: t('shell.nav-communication'), icon: 'pi pi-comments',   to: '/communication', match: '/communication' }
]);

/**
 * Determines whether a navigation item corresponds to the current route.
 * @param {string} match - Path prefix used to match the active section.
 * @returns {boolean} True when the item should be highlighted as active.
 */
const isActive = (match) => route.path.startsWith(match);
</script>

<template>
    <aside
        class="flex flex-column fixed left-0 top-0"
        style="width: 16rem; height: 100vh; background: var(--p-surface-0); border-right: 1px solid var(--p-surface-200); z-index: 20;">
        <div class="p-4" style="border-bottom: 1px solid var(--p-surface-200);">
            <AccountSummary :name="t('shell.brand')" :role="t('shell.role-default')" />
        </div>

        <nav class="flex flex-column gap-1 p-2" style="flex: 1; overflow-y: auto;">
            <router-link
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="flex align-items-center gap-3 p-3 border-round no-underline"
                :class="isActive(item.match) ? 'font-semibold' : 'text-color'"
                :style="isActive(item.match)
                    ? 'background: var(--p-primary-50); color: var(--p-primary-color);'
                    : ''">
                <i :class="item.icon" />
                <span>{{ item.label }}</span>
            </router-link>
        </nav>

        <div class="p-3 text-center text-color-secondary" style="border-top: 1px solid var(--p-surface-200);">
            <small>{{ t('shell.footer') }}</small>
        </div>
    </aside>
</template>
