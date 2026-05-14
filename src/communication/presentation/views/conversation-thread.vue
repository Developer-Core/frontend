<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
import useCommunicationStore from '../../application/communication.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';
import { SendMessageCommand } from '../../domain/send-message.command.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const communicationStore = useCommunicationStore();
const ordersStore        = useOrdersStore();

const { errors, conversationsLoaded, messagesLoaded } = toRefs(communicationStore);

const { fetchConversations, fetchMessages, getConversationById, getMessagesByConversationId, sendMessage } = communicationStore;
const { fetchOrders, getOrderById } = ordersStore;

/**
 * Draft content typed in the composer.
 * @type {import('vue').Ref<string>}
 */
const draft = ref('');

/**
 * Reference to the message list container, used to auto-scroll to the bottom.
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const listRef = ref(null);

onMounted(() => {
    if (!communicationStore.conversationsLoaded) fetchConversations();
    if (!communicationStore.messagesLoaded)      fetchMessages();
    if (!ordersStore.ordersLoaded)               fetchOrders();
});

/**
 * Conversation currently being viewed.
 * @type {import('vue').ComputedRef<import('../../domain/conversation.entity.js').Conversation|undefined>}
 */
const conversation = computed(() => getConversationById(route.params.id));

/**
 * Order linked to the conversation.
 * @type {import('vue').ComputedRef<import('../../../orders/domain/order.entity.js').Order|undefined>}
 */
const order = computed(() => conversation.value ? getOrderById(conversation.value.orderId) : undefined);

/**
 * Messages of the current conversation in chronological order.
 * @type {import('vue').ComputedRef<import('../../domain/message.entity.js').Message[]>}
 */
const messages = computed(() => conversation.value ? getMessagesByConversationId(conversation.value.id) : []);

watch(messages, async () => {
    await nextTick();
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight;
});

/**
 * Format an ISO date string into a short locale-aware label.
 * @param {?string} isoDate - ISO date string to format.
 * @returns {string} Human-readable date label.
 */
const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleString();
};

/** Persist the draft as a new message from the carpenter. */
const send = async () => {
    const content = draft.value.trim();
    if (!content || !conversation.value) return;
    await sendMessage(new SendMessageCommand({
        conversationId: conversation.value.id,
        senderName:     'Taller',
        senderRole:     'carpenter',
        content
    }));
    draft.value = '';
};

/** Navigate back to the conversation list. */
const back = () => router.push({ name: 'communication-list' });
</script>

<template>
    <div class="p-4 flex flex-column" style="height: calc(100vh - 2rem)">
        <div class="flex align-items-center gap-2 mb-3">
            <pv-button
                icon="pi pi-arrow-left"
                text rounded
                :aria-label="t('common.back')"
                v-tooltip.top="t('common.back')"
                @click="back" />
            <div>
                <h1 class="text-xl font-semibold m-0">{{ order?.projectName ?? t('communication.unknown-order') }}</h1>
                <div class="text-sm text-color-secondary">{{ order?.clientName ?? '—' }}</div>
            </div>
        </div>

        <div v-if="!conversationsLoaded || !messagesLoaded" class="text-color-secondary">
            {{ t('communication.loading') }}
        </div>

        <div v-else-if="conversation" class="flex flex-column gap-3" style="flex: 1; min-height: 0">
            <div
                ref="listRef"
                class="flex flex-column gap-2 p-3 border-round overflow-auto"
                style="flex: 1; background: var(--p-surface-50)">
                <div v-if="messages.length === 0" class="text-color-secondary text-center">
                    {{ t('communication.no-messages') }}
                </div>
                <div
                    v-for="message in messages"
                    :key="message.id"
                    class="flex"
                    :class="message.senderRole === 'carpenter' ? 'justify-content-end' : 'justify-content-start'">
                    <div
                        class="p-3 border-round"
                        :style="message.senderRole === 'carpenter'
                            ? 'background: var(--p-primary-color); color: var(--p-primary-contrast-color); max-width: 70%;'
                            : 'background: var(--p-surface-0); border: 1px solid var(--p-surface-200); max-width: 70%;'">
                        <div class="text-xs mb-1" :style="message.senderRole === 'carpenter' ? 'opacity: 0.85' : 'color: var(--p-text-muted-color)'">
                            {{ message.senderName }} · {{ formatDate(message.sentAt) }}
                        </div>
                        <div>{{ message.content }}</div>
                    </div>
                </div>
            </div>

            <form class="flex gap-2 align-items-end" @submit.prevent="send">
                <div class="flex-1" style="min-width: 0">
                    <pv-textarea
                        v-model="draft"
                        :placeholder="t('communication.compose-placeholder')"
                        rows="2"
                        auto-resize
                        class="w-full" />
                </div>
                <pv-button type="submit" icon="pi pi-send" :label="t('communication.send')" :disabled="!draft.trim()" />
            </form>
        </div>

        <div v-else class="text-color-secondary">
            {{ t('communication.thread-not-found') }}
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
