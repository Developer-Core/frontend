<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { TrackingApi } from '../../infrastructure/tracking-api.js';

const { t }  = useI18n();
const route  = useRoute();
const router = useRouter();
const trackingApi = new TrackingApi();

const code     = ref(route.params.id || '');
const status   = ref(null);
const loading  = ref(false);
const notFound = ref(false);
const searched = ref(false);

/** Looks up the public tracking status for a code. */
async function load(id) {
    if (!id) { status.value = null; notFound.value = false; searched.value = false; return; }
    loading.value = true; notFound.value = false; searched.value = true;
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
watch(() => route.params.id, (id) => { if (id) code.value = id; load(id); }, { immediate: true });

/** Navigates to the tracking result for the typed code. */
function search() {
    const value = code.value.trim();
    if (!value) return;
    router.push({ name: 'public-tracking', params: { id: value } });
}

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : null);

/** The order's real production stages (empty until the carpenter defines them). */
const stages = computed(() => status.value?.stages ?? []);

/** Whether a real stage is done, current or pending based on its backend status. */
const stageState = (stage) => {
    const s = String(stage.status || '').toLowerCase();
    return s === 'completed' ? 'done' : s === 'inprogress' ? 'current' : 'pending';
};

const progressStyle = computed(() => ({ width: `${status.value?.progressPercent ?? 0}%` }));
</script>

<template>
    <div class="public-tracking-page min-h-screen flex flex-column align-items-center justify-content-center p-4">
        <div class="public-tracking-page__container w-full">
            <header class="mb-4">
                <h1 class="text-xl font-semibold m-0">{{ t('public-tracking.brand') }}</h1>
                <p class="text-color-secondary m-0">{{ t('public-tracking.subtitle') }}</p>
            </header>

            <!-- Search -->
            <form class="flex gap-2 mb-4" @submit.prevent="search">
                <pv-icon-field class="flex-1">
                    <pv-input-icon class="pi pi-hashtag" />
                    <pv-input-text v-model.trim="code" class="w-full"
                                   :placeholder="t('public-tracking.search-placeholder')" />
                </pv-icon-field>
                <pv-button type="submit" icon="pi pi-search" :label="t('public-tracking.search-button')" :disabled="!code" />
            </form>

            <div v-if="loading" class="text-color-secondary">{{ t('public-tracking.loading') }}</div>

            <pv-card v-else-if="status">
                <template #title>{{ t('public-tracking.status-title') }}</template>
                <template #content>
                    <div class="mb-4">
                        <div class="flex justify-content-between align-items-center mb-2">
                            <strong>{{ t('public-tracking.progress') }}</strong>
                            <span class="font-medium">{{ status.progressPercent ?? 0 }}%</span>
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
                            <span class="text-color-secondary text-sm ml-auto">{{ stage.estimatedTimeInDays }} {{ t('production.days') }}</span>
                            <pv-tag v-if="stageState(stage) === 'current'" :value="t('public-tracking.in-progress')" severity="info" />
                        </div>
                    </div>
                    <p v-else class="text-color-secondary mb-3">{{ t('public-tracking.no-stages') }}</p>

                    <div class="tracking-summary flex justify-content-between align-items-center p-3 border-round">
                        <span class="text-color-secondary">{{ t('public-tracking.estimated-delivery') }}</span>
                        <strong>{{ formatDate(status.estimatedDeliveryDate) || t('public-tracking.to-be-confirmed') }}</strong>
                    </div>
                    <div class="text-center text-color-secondary mt-3">
                        <small>{{ t('public-tracking.tracking-code') }}: {{ route.params.id }}</small>
                    </div>
                </template>
            </pv-card>

            <pv-card v-else-if="searched && notFound">
                <template #content>
                    <div class="text-center py-4">
                        <i class="pi pi-search text-3xl text-color-secondary mb-3" />
                        <p class="text-color-secondary m-0">{{ t('public-tracking.not-found') }}</p>
                    </div>
                </template>
            </pv-card>

            <div v-else class="text-center text-color-secondary py-4">
                <i class="pi pi-box text-3xl mb-3" />
                <p class="m-0">{{ t('public-tracking.search-hint') }}</p>
            </div>

            <footer class="text-center text-color-secondary mt-4">
                <small>{{ t('public-tracking.footer') }}</small>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.public-tracking-page {
    background: var(--p-surface-50);
}

.public-tracking-page__container {
    max-width: 40rem;
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
</style>
