<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { computed, onMounted, toRefs } from 'vue';
import useCommunicationStore from '../../application/communication.store.js';
import useOrdersStore from '../../../orders/application/orders.store.js';

const { t } = useI18n();
const router = useRouter();

const communicationStore = useCommunicationStore();
const ordersStore        = useOrdersStore();

const { conversations, messages, conversationsLoaded, messagesLoaded, errors } = toRefs(communicationStore);
const { orders } = toRefs(ordersStore);

const { fetchConversations, fetchMessages, getMessagesByConversationId } = communicationStore;
const { fetchOrders } = ordersStore;

onMounted(() => {
    if (!communicationStore.conversationsLoaded) fetchConversations();
    if (!communicationStore.messagesLoaded)      fetchMessages();
    if (!ordersStore.ordersLoaded)               fetchOrders();
});

/**
 * Conversation rows enriched with the related order and a preview of the last message.
 * @type {import('vue').ComputedRef<Array<{conversation: import('../../domain/conversation.entity.js').Conversation, order: import('../../../orders/domain/order.entity.js').Order|undefined, lastMessage: import('../../domain/message.entity.js').Message|undefined}>>}
 */
const rows = computed(() => {
    return conversations.value
        .map(conversation => {
            const order = orders.value.find(o => o.id === conversation.orderId);
            const conversationMessages = getMessagesByConversationId(conversation.id);
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            return { conversation, order, lastMessage };
        })
        .sort((a, b) => {
            const aTime = a.conversation.lastMessageAt ?? '';
            const bTime = b.conversation.lastMessageAt ?? '';
            return bTime.localeCompare(aTime);
        });
});

/**
 * Format an ISO date string into a short locale-aware label.
 * @param {?string} isoDate - ISO date string to format.
 * @returns {string} Human-readable date label.
 */
const formatDate = (isoDate) => {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleString();
};

/**
 * Navigate to the conversation thread.
 * @param {number} id - Conversation identifier.
 */
const openThread = (id) => {
    router.push({ name: 'communication-thread', params: { id } });
};
</script>

<template>
    <div class="p-4">
        <h1 class="text-2xl font-semibold mb-3">{{ t('communication.title') }}</h1>

        <div v-if="!conversationsLoaded || !messagesLoaded" class="text-color-secondary">
            {{ t('communication.loading') }}
        </div>

        <div v-else-if="rows.length === 0" class="text-color-secondary">
            {{ t('communication.empty') }}
        </div>

        <div v-else class="flex flex-column gap-2">
            <pv-card
                v-for="row in rows"
                :key="row.conversation.id"
                class="cursor-pointer"
                @click="openThread(row.conversation.id)">
                <template #content>
                    <div class="flex justify-content-between align-items-start gap-3">
                        <div>
                            <div class="font-semibold mb-1">{{ row.order?.projectName ?? t('communication.unknown-order') }}</div>
                            <div class="text-sm text-color-secondary mb-2">{{ row.order?.clientName ?? '—' }}</div>
                            <div v-if="row.lastMessage" class="text-sm">
                                <strong>{{ row.lastMessage.senderName }}:</strong>
                                {{ row.lastMessage.content }}
                            </div>
                            <div v-else class="text-sm text-color-secondary">
                                {{ t('communication.no-messages') }}
                            </div>
                        </div>
                        <div class="text-sm text-color-secondary white-space-nowrap">
                            {{ formatDate(row.conversation.lastMessageAt) }}
                        </div>
                    </div>
                </template>
            </pv-card>
        </div>

        <div v-if="errors.length" class="text-red-500 mt-3">
            {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
    </div>
</template>
