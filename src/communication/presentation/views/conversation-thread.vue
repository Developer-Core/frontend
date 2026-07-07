<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import useCommunicationStore from '../../application/communication.store.js';
import useIamStore from '../../../iam/application/iam.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';
import { SenderType } from '../../domain/message.entity.js';

const { t, locale } = useI18n();
const route    = useRoute();
const router   = useRouter();
const store    = useCommunicationStore();
const iamStore = useIamStore();
const ordersStore = useOrdersStore();
const { messages, messagesLoaded, errors } = toRefs(store);

const orderId = computed(() => route.params.id);
const draft   = ref('');
const listRef = ref(null);
const order = computed(() => ordersStore.getOrderById(orderId.value) || ordersStore.currentOrder);

/** The signed-in user posts as the Workshop when a carpenter, otherwise as the Client. */
const mySenderType = computed(() => (iamStore.currentRole === 'Carpenter' ? SenderType.WORKSHOP : SenderType.CLIENT));

onMounted(() => {
    store.fetchMessages(orderId.value);
    if (!ordersStore.ordersLoaded) ordersStore.fetchOrders();
    ordersStore.fetchOrderById(orderId.value);
    iamStore.fetchUsers();
    iamStore.fetchProfiles();
});

watch(messages, async () => {
    await nextTick();
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight;
}, { deep: true });

/** Whether a message was sent by the signed-in user (right-aligned bubble). */
const isMine = (message) => message.senderId === iamStore.currentUserId;

/** Human label for a message's sender. */
const senderLabel = (message) =>
    (message.senderType === SenderType.WORKSHOP ? t('communication.sender-workshop') : t('communication.sender-client'));

const counterpartName = computed(() => {
    if (!order.value) return '';
    const counterpartId = iamStore.currentRole === 'Carpenter' ? order.value.customerId : order.value.carpenterId;
    return iamStore.displayNameById(counterpartId);
});

const threadTitle = computed(() => {
    if (!order.value) return t('communication.thread-title', { id: orderId.value });
    return order.value.details?.furnitureType || t('communication.thread-title', { id: orderId.value });
});

const threadSubtitle = computed(() => {
    if (!order.value) return '';
    const counterpartRole = iamStore.currentRole === 'Carpenter'
        ? t('communication.sender-client')
        : t('communication.sender-workshop');
    const counterpart = counterpartName.value;
    const orderLabel = t('communication.order-label', { id: order.value.id });
    return counterpart
        ? `${counterpartRole}: ${counterpart} · ${orderLabel}`
        : orderLabel;
});

const sameDay = (left, right) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

const formatMessageTime = (iso) => {
    if (!iso) return '';

    const sentAt = new Date(iso);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const time = sentAt.toLocaleTimeString(locale.value, {
        hour: 'numeric',
        minute: '2-digit'
    });

    if (sameDay(sentAt, now)) return time;
    if (sameDay(sentAt, yesterday)) return `${t('communication.yesterday')}, ${time}`;

    return sentAt.toLocaleDateString(locale.value, {
        day: 'numeric',
        month: 'short'
    });
};

const handleComposerKeydown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    send();
};

/** Sends the drafted message in this order's thread. */
async function send() {
    const content = draft.value.trim();
    if (!content) return;
    await store.sendMessage(orderId.value, {
        content,
        senderType: mySenderType.value,
        senderId:   iamStore.currentUserId
    });
    draft.value = '';
}

const back = () => router.push({ name: 'communication-list' });
</script>

<template>
    <div class="conversation-thread p-4">
        <div class="conversation-thread__header flex align-items-center gap-2">
            <pv-button icon="pi pi-arrow-left" text rounded v-tooltip.top="t('common.back')"
                       :aria-label="t('common.back')" @click="back" />
            <div class="conversation-thread__header-copy">
                <h1 class="text-xl font-semibold m-0">{{ threadTitle }}</h1>
                <p v-if="threadSubtitle" class="conversation-thread__subtitle m-0">{{ threadSubtitle }}</p>
            </div>
        </div>

        <div v-if="!messagesLoaded" class="text-color-secondary">{{ t('communication.loading') }}</div>

        <div v-else class="conversation-thread__panel">
            <div ref="listRef" class="conversation-thread__messages">
                <div v-if="messages.length === 0" class="conversation-thread__empty text-color-secondary text-center">
                    {{ t('communication.no-messages') }}
                </div>
                <div v-for="message in messages" :key="message.id" class="flex"
                     :class="isMine(message) ? 'justify-content-end' : 'justify-content-start'">
                    <div
                        class="conversation-thread__bubble p-3 border-round"
                        :class="isMine(message)
                            ? 'conversation-thread__bubble--mine'
                            : 'conversation-thread__bubble--theirs'">
                        <div
                            class="conversation-thread__meta text-xs mb-1"
                            :class="isMine(message)
                                ? 'conversation-thread__meta--mine'
                                : 'conversation-thread__meta--theirs'">
                            <span>{{ senderLabel(message) }}</span>
                            <span aria-hidden="true">•</span>
                            <span>{{ formatMessageTime(message.sentAt) }}</span>
                        </div>
                        <div class="conversation-thread__content">{{ message.content }}</div>
                    </div>
                </div>
            </div>

            <form class="conversation-thread__composer" @submit.prevent="send">
                <pv-textarea
                    v-model="draft"
                    auto-resize
                    rows="1"
                    :placeholder="t('communication.compose-placeholder')"
                    class="conversation-thread__textarea"
                    @keydown="handleComposerKeydown" />
                <pv-button
                    type="submit"
                    icon="pi pi-send"
                    :label="t('communication.send')"
                    :disabled="!draft.trim()" />
            </form>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>

<style scoped>
.conversation-thread {
    height: calc(100dvh - 3.5rem);
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 1rem;
    overflow: hidden;
    padding: 1.5rem;
}

.conversation-thread__panel {
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    background: var(--surface-card);
    box-shadow: var(--shadow-subtle);
    overflow: hidden;
}

.conversation-thread__header-copy {
    min-width: 0;
}

.conversation-thread__subtitle {
    margin-top: 0.25rem;
    color: var(--p-text-muted-color);
    font-size: 0.875rem;
    line-height: 1.35;
}

.conversation-thread__messages {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    padding-right: 0.25rem;
}

.conversation-thread__empty {
    margin: auto 0;
}

.conversation-thread__bubble {
    max-width: min(42rem, 78%);
    overflow-wrap: anywhere;
}

.conversation-thread__bubble--mine {
    background: var(--p-primary-color);
    color: var(--p-primary-contrast-color);
}

.conversation-thread__bubble--theirs {
    background: var(--surface-canvas);
    border: 1px solid var(--color-border);
}

.conversation-thread__meta--mine {
    opacity: 0.85;
}

.conversation-thread__meta--theirs {
    color: var(--p-text-muted-color);
}

.conversation-thread__meta {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    line-height: 1.2;
}

.conversation-thread__content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.conversation-thread__composer {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    padding-top: 0.25rem;
    border-top: 1px solid var(--p-surface-200);
}

.conversation-thread__textarea {
    flex: 1;
    min-width: 0;
}

.conversation-thread__textarea :deep(.p-textarea) {
    width: 100%;
    min-height: 3rem;
    max-height: 9rem;
    resize: none;
}

@media (max-width: 768px) {
    .conversation-thread {
        height: calc(100dvh - 3.5rem);
        padding: 1rem;
    }

    .conversation-thread__panel {
        padding: 0.875rem;
    }

    .conversation-thread__bubble {
        max-width: 88%;
    }

    .conversation-thread__composer {
        align-items: stretch;
        flex-direction: column;
    }

    .conversation-thread__composer :deep(.p-button) {
        width: 100%;
    }
}
</style>
