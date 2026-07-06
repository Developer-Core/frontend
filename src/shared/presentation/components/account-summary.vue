<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    /**
     * Display name shown next to the avatar.
     * @type {import('vue').PropType<string>}
     */
    name: { type: String, default: 'WoodRoute' },
    /**
     * Role label rendered below the name.
     * @type {import('vue').PropType<string>}
     */
    role: { type: String, default: '' },
    /**
     * URL of the avatar image.
     * @type {import('vue').PropType<string>}
     */
    avatar: { type: String, default: '' }
});
</script>

<template>
    <div class="flex align-items-center gap-3 min-w-0">
        <div
            class="border-circle flex align-items-center justify-content-center flex-shrink-0"
            style="width: 3rem; height: 3rem; background: var(--p-primary-100); color: var(--p-primary-color); border: 1px solid var(--p-surface-300); overflow: hidden;">
            <img v-if="avatar" :src="avatar" :alt="name" style="width: 100%; height: 100%; object-fit: cover;" />
            <i v-else class="pi pi-user text-xl" />
        </div>
        <div class="flex flex-column" style="min-width: 0">
            <strong class="text-color account-summary__text">{{ props.name }}</strong>
            <small class="text-color-secondary account-summary__text">{{ props.role || t('shell.role-default') }}</small>
        </div>
    </div>
</template>

<style scoped>
.account-summary__text {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
