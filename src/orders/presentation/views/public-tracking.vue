<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { TrackingApi } from '../../infrastructure/tracking-api.js';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const { t }  = useI18n();
const route  = useRoute();
const router = useRouter();
const trackingApi = new TrackingApi();

const status   = ref(null);
const loading  = ref(false);
const notFound = ref(false);

/** Looks up the public tracking status for a code. */
async function load(id) {
    if (!id) { status.value = null; notFound.value = false; return; }
    loading.value = true; notFound.value = false;
    try {
        const { data } = await trackingApi.getStatus(id);
        status.value = data;
    } catch {
        status.value = null;
        notFound.value = true;
    } finally {
        loading.value = false;
    }
}

// React to the route code (also runs on first load).
watch(() => route.params.id, (id) => { load(id); }, { immediate: true });

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : null);

/** The order's real production stages (empty until the carpenter defines them). */
const stages = computed(() => status.value?.stages ?? []);

/** Whether a real stage is done, current or pending based on its backend status. */
const stageState = (stage) => {
    const s = String(stage.status || '').toLowerCase();
    return s === 'completed' ? 'done' : s === 'inprogress' ? 'current' : 'pending';
};

const progressStyle = computed(() => ({ width: `${status.value?.progressPercent ?? 0}%` }));
const progressPercent = computed(() => Number(status.value?.progressPercent ?? 0));
const isCompleted = computed(() => progressPercent.value >= 100);
</script>

<template>
    <div class="public-tracking-page min-h-screen flex flex-column align-items-center justify-content-center p-4">
        <div class="public-tracking-page__container w-full">
            <header class="public-tracking-page__header mb-4">
                <div>
                    <h1 class="text-xl font-semibold m-0">{{ t('public-tracking.brand') }}</h1>
                    <p class="public-tracking-page__subtitle m-0">{{ t('public-tracking.subtitle') }}</p>
                </div>
                <language-switcher />
            </header>

            <div v-if="loading" class="text-color-secondary">{{ t('public-tracking.loading') }}</div>

            <pv-card v-else-if="status" class="public-tracking-page__status-card">
                <template #title>
                    <div class="flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <div class="text-xl font-semibold">{{ t('public-tracking.status-title') }}</div>
                            <small class="public-tracking-page__tracking-code">{{ t('public-tracking.tracking-code') }}: {{ route.params.id }}</small>
                        </div>
                        <pv-tag
                            :value="isCompleted ? t('public-tracking.completed-badge') : t('public-tracking.in-progress')"
                            :severity="isCompleted ? 'success' : 'info'" />
                    </div>
                </template>
                <template #content>
                    <div v-if="isCompleted" class="public-tracking-page__completed mb-4">
                        <i class="pi pi-check-circle text-xl" />
                        <div>
                            <strong class="block mb-1">{{ t('public-tracking.completed-title') }}</strong>
                            <span class="public-tracking-page__completed-copy">{{ t('public-tracking.completed-copy') }}</span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-content-between align-items-center mb-2">
                            <strong>{{ t('public-tracking.progress') }}</strong>
                            <span class="font-medium">{{ progressPercent }}%</span>
                        </div>
                        <div class="public-tracking-page__progress border-round overflow-hidden">
                            <div class="public-tracking-page__progress-fill" :style="progressStyle" />
                        </div>
                    </div>

                    <!-- Real production stage timeline -->
                    <div v-if="stages.length" class="flex flex-column gap-2 mb-3">
                        <div v-for="stage in stages" :key="stage.orderIndex"
                             class="tracking-stage flex align-items-center gap-3 p-2 border-round"
                             :class="{ 'tracking-stage--current': stageState(stage) === 'current' }">
                            <span class="tracking-stage__icon flex align-items-center justify-content-center border-circle flex-shrink-0"
                                  :class="`tracking-stage__icon--${stageState(stage)}`">
                                <i :class="stageState(stage) === 'done' ? 'pi pi-check' : 'pi pi-circle-fill'" class="tracking-stage__icon-symbol" />
                            </span>
                            <span :class="stageState(stage) === 'pending' ? 'text-color-secondary' : 'font-medium'">
                                {{ stage.orderIndex + 1 }}. {{ stage.name }}
                            </span>
                            <span class="public-tracking-page__stage-meta text-sm ml-auto">{{ stage.estimatedTimeInDays }} {{ t('production.days') }}</span>
                            <pv-tag v-if="stageState(stage) === 'current'" :value="t('public-tracking.in-progress')" severity="info" />
                        </div>
                    </div>
                    <p v-else class="public-tracking-page__muted mb-3">{{ t('public-tracking.no-stages') }}</p>

                    <div class="tracking-summary flex justify-content-between align-items-center p-3 border-round">
                        <span class="public-tracking-page__summary-label">{{ t('public-tracking.estimated-delivery') }}</span>
                        <strong>{{ formatDate(status.estimatedDeliveryDate) || t('public-tracking.to-be-confirmed') }}</strong>
                    </div>

                    <div class="public-tracking-page__actions mt-4">
                        <pv-button text icon="pi pi-arrow-left" :label="t('public-tracking.search-another')" @click="router.push({ name: 'landing' })" />
                        <pv-button outlined icon="pi pi-sign-in" :label="t('landing.workshop-access')" @click="router.push({ name: 'login' })" />
                    </div>
                </template>
            </pv-card>

            <pv-card v-else-if="notFound">
                <template #content>
                    <div class="text-center py-4">
                        <i class="pi pi-search text-3xl text-color-secondary mb-3" />
                        <p class="public-tracking-page__muted m-0">{{ t('public-tracking.not-found') }}</p>
                        <div class="mt-4">
                            <pv-button text icon="pi pi-arrow-left" :label="t('public-tracking.search-another')" @click="router.push({ name: 'landing' })" />
                        </div>
                    </div>
                </template>
            </pv-card>

            <footer class="public-tracking-page__footer text-center mt-4">
                <small>{{ t('public-tracking.footer') }}</small>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.public-tracking-page {
    background:
        radial-gradient(1200px 600px at 100% 0%, var(--p-primary-100) 0%, transparent 55%),
        radial-gradient(1000px 500px at 0% 100%, var(--p-primary-50) 0%, transparent 55%),
        var(--p-surface-50);
}

.public-tracking-page__container {
    max-width: 40rem;
}

.public-tracking-page__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.public-tracking-page__subtitle,
.public-tracking-page__muted,
.public-tracking-page__stage-meta,
.public-tracking-page__summary-label,
.public-tracking-page__footer {
    color: color-mix(in srgb, var(--p-text-color) 58%, white);
}

.public-tracking-page__tracking-code {
    color: color-mix(in srgb, var(--p-text-color) 66%, white);
}

.public-tracking-page__status-card {
    border: 1px solid var(--p-surface-200);
    box-shadow: 0 10px 30px rgba(67, 15, 5, 0.08);
}

.public-tracking-page__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.public-tracking-page__completed {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem;
    border-radius: 0.75rem;
    color: var(--p-green-700);
    background: var(--p-green-50);
}

.public-tracking-page__completed-copy {
    color: color-mix(in srgb, var(--p-green-900) 58%, white);
}

.public-tracking-page__progress {
    height: 0.6rem;
    background: var(--p-surface-200);
}

.public-tracking-page__progress-fill {
    height: 100%;
    background: var(--p-primary-color);
    transition: width 0.3s ease;
}

.tracking-stage--current {
    background: var(--p-primary-50);
}

.tracking-stage__icon {
    width: 1.75rem;
    height: 1.75rem;
}

.tracking-stage__icon--done {
    background: var(--p-green-500);
    color: #fff;
}

.tracking-stage__icon--current {
    background: var(--p-primary-color);
    color: #fff;
}

.tracking-stage__icon--pending {
    background: var(--p-surface-200);
    color: var(--p-text-muted-color);
}

.tracking-stage__icon-symbol {
    font-size: 0.6rem;
}

.tracking-summary {
    background: var(--p-surface-100);
}

@media (max-width: 640px) {
    .public-tracking-page__header,
    .public-tracking-page__actions {
        flex-direction: column;
    }
}
</style>
