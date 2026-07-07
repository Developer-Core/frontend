<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import AccountSummary from './account-summary.vue';
import useIamStore from '../../../iam/application/iam.store.js';

const { t }    = useI18n();
const route    = useRoute();
const router   = useRouter();
const confirm  = useConfirm();
const iamStore = useIamStore();
const profileMenuOpen = ref(false);
const footerRef = ref(null);

/**
 * Navigation items rendered in the sidebar.
 * Each entry maps to a top-level bounded-context section and declares which
 * roles may see it. `roles: null` means visible to every signed-in role.
 * @type {import('vue').ComputedRef<Array<{label: string, icon: string, to: string, match: string, roles: ?string[]}>>}
 */
const navItems = computed(() => [
    { label: t('shell.nav-orders'),        icon: 'pi pi-receipt',    to: '/orders',        match: '/orders',        roles: null },
    { label: t('shell.nav-production'),    icon: 'pi pi-calendar',   to: '/production',    match: '/production',    roles: ['Carpenter'] },
    { label: t('shell.nav-inventory'),     icon: 'pi pi-box',        to: '/inventory',     match: '/inventory',     roles: ['Carpenter'] },
    { label: t('shell.nav-communication'), icon: 'pi pi-comments',   to: '/communication', match: '/communication', roles: null }
]);

/**
 * Navigation items visible to the signed-in user's role. Items with `roles: null`
 * are shown to everyone; otherwise the current role must be listed.
 * @type {import('vue').ComputedRef<Array<Object>>}
 */
const visibleNavItems = computed(() =>
    navItems.value.filter(item => !item.roles || item.roles.includes(iamStore.currentRole))
);

/** Human-readable label for the signed-in user's role. */
const roleLabel = computed(() => {
    if (iamStore.currentRole === 'Carpenter') return t('iam.role-carpenter');
    if (iamStore.currentRole === 'Client')    return t('iam.role-client');
    return t('shell.role-default');
});

/**
 * Determines whether a navigation item corresponds to the current route.
 * @param {string} match - Path prefix used to match the active section.
 * @returns {boolean} True when the item should be highlighted as active.
 */
const isActive = (match) => route.path.startsWith(match);

const userLabel = computed(() => iamStore.currentEmail || t('shell.profile-title'));
const showProfileMenu = computed(() => iamStore.isSignedIn);

const toggleProfileMenu = () => {
    profileMenuOpen.value = !profileMenuOpen.value;
};

const closeProfileMenu = () => {
    profileMenuOpen.value = false;
};

const handleDocumentClick = (event) => {
    if (!profileMenuOpen.value) return;
    if (footerRef.value?.contains(event.target)) return;
    closeProfileMenu();
};

/** Shows a confirmation dialog before clearing the active session. */
const confirmLogout = () => {
    confirm.require({
        message: t('shell.logout-confirm-message'),
        header: t('shell.logout-confirm-title'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-primary',
        acceptLabel: t('shell.logout'),
        rejectClass: 'p-button-outlined p-button-secondary',
        rejectLabel: t('common.cancel'),
        accept: () => iamStore.signOut(router)
    });
};

onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
    <aside
        class="sidebar flex flex-column fixed left-0 top-0"
        style="background: var(--surface-card);">
        <div class="sidebar__brand p-4">
            <div class="flex align-items-center gap-3 min-w-0">
                <div class="sidebar__brand-mark flex align-items-center justify-content-center flex-shrink-0">
                    <i class="pi pi-box text-lg" />
                </div>
                <div class="min-w-0">
                    <strong class="block text-lg text-color">{{ t('shell.brand') }}</strong>
                    <small class="text-color-secondary">{{ t('shell.role-default') }}</small>
                </div>
            </div>
        </div>

        <nav class="sidebar__nav flex flex-column gap-1 p-2">
            <router-link
                v-for="item in visibleNavItems"
                :key="item.to"
                :to="item.to"
                class="sidebar__link flex align-items-center gap-3 p-3 border-round no-underline"
                :class="{ 'sidebar__link--active': isActive(item.match) }">
                <i :class="item.icon" />
                <span>{{ item.label }}</span>
            </router-link>
        </nav>

        <div v-if="showProfileMenu" ref="footerRef" class="sidebar__footer p-3">
            <pv-button
                text
                class="sidebar__profile-toggle w-full"
                @click="toggleProfileMenu">
                <template #default>
                    <div class="flex align-items-center gap-3 w-full min-w-0 text-left">
                        <AccountSummary :name="userLabel" :role="roleLabel" />
                        <i
                            class="pi ml-auto flex-shrink-0 text-color-secondary"
                            :class="profileMenuOpen ? 'pi-angle-right sidebar__chevron--open' : 'pi-angle-right'" />
                    </div>
                </template>
            </pv-button>

            <div v-if="profileMenuOpen" class="sidebar__profile-menu">
                <pv-button
                    :label="t('shell.logout')"
                    icon="pi pi-sign-out"
                    severity="secondary"
                    text
                    class="w-full justify-content-start"
                    @click="confirmLogout" />
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    width: 16rem;
    height: 100vh;
    z-index: 20;
    border-right: 1px solid var(--p-surface-200);
    overflow: visible;
}

.sidebar__brand {
    border-bottom: 1px solid var(--p-surface-200);
}

.sidebar__brand-mark {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background: linear-gradient(180deg, var(--p-primary-50), var(--p-primary-100));
    color: var(--p-primary-color);
    border: 1px solid var(--p-primary-100);
}

.sidebar__nav {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.sidebar__link {
    color: var(--p-text-color);
    transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}

.sidebar__link:hover {
    background: var(--p-primary-50);
    color: var(--p-primary-color);
    transform: translateX(2px);
}

.sidebar__link:hover i {
    color: var(--p-primary-color);
}

.sidebar__link--active {
    background: var(--p-primary-50);
    color: var(--p-primary-color);
    font-weight: 600;
}

.sidebar__footer {
    border-top: 1px solid var(--p-surface-200);
    position: relative;
    overflow: visible;
}

.sidebar__profile-toggle {
    padding: 0.75rem;
    border-radius: 0.75rem;
    justify-content: flex-start;
}

.sidebar__profile-toggle:hover {
    background: var(--p-primary-50);
    color: var(--p-primary-color);
}

.sidebar__profile-toggle:hover :deep(.account-summary__text),
.sidebar__profile-toggle:hover .text-color-secondary,
.sidebar__profile-toggle:hover .pi {
    color: var(--p-primary-color) !important;
}

.sidebar__profile-menu {
    position: absolute;
    left: calc(100% + 0.75rem);
    top: 50%;
    transform: translateY(-50%);
    min-width: 12rem;
    padding: 0.5rem;
    background: var(--p-surface-0);
    border: 1px solid var(--p-surface-200);
    border-radius: 0.75rem;
    box-shadow: 0 12px 30px rgba(26, 23, 21, 0.12);
    z-index: 30;
}

.sidebar__profile-menu :deep(.p-button) {
    transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}

.sidebar__profile-menu :deep(.p-button:hover) {
    background: var(--p-primary-50);
    color: var(--p-primary-color);
    transform: translateX(2px);
}

.sidebar__profile-menu :deep(.p-button:hover .p-button-icon),
.sidebar__profile-menu :deep(.p-button:hover .p-button-label) {
    color: var(--p-primary-color);
}

.sidebar__chevron--open {
    transform: rotate(90deg);
}
</style>
