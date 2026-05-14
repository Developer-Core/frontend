/**
 * Application service store for the `Quotes` bounded context.
 * It coordinates quote and quote-item use cases and exposes profitability calculations.
 *
 * @module useQuotesStore
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { QuotesApi } from '../infrastructure/quotes-api.js';
import { QuoteAssembler } from '../infrastructure/quote.assembler.js';
import { QuoteItemAssembler } from '../infrastructure/quote-item.assembler.js';
import { Quote } from '../domain/quote.entity.js';
import { QuoteItem } from '../domain/quote-item.entity.js';

const quotesApi = new QuotesApi();

/**
 * Reactive store that exposes Quotes commands and queries.
 *
 * @returns {Object} Store state and actions.
 */
const useQuotesStore = defineStore('quotes', () => {
    /**
     * List of quote entities.
     * @type {import('vue').Ref<Quote[]>}
     */
    const quotes = ref([]);
    /**
     * List of quote-item entities.
     * @type {import('vue').Ref<QuoteItem[]>}
     */
    const quoteItems = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether quotes have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const quotesLoaded = ref(false);
    /**
     * Whether quote items have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const quoteItemsLoaded = ref(false);

    /**
     * Loads quotes from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchQuotes() {
        quotesApi.getQuotes().then(response => {
            quotes.value = QuoteAssembler.toEntitiesFromResponse(response);
            quotesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Loads quote items from infrastructure and updates the application state.
     * @returns {void}
     */
    function fetchQuoteItems() {
        quotesApi.getQuoteItems().then(response => {
            quoteItems.value = QuoteItemAssembler.toEntitiesFromResponse(response);
            quoteItemsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Finds a quote entity by identifier.
     * @param {number|string} id - Quote identifier.
     * @returns {Quote|undefined} Matching quote, if available.
     */
    function getQuoteById(id) {
        const idNum = parseInt(id);
        return quotes.value.find(quote => quote.id === idNum);
    }

    /**
     * Returns the items that belong to a quote.
     * @param {number} quoteId - Quote identifier.
     * @returns {QuoteItem[]} Items related to the quote.
     */
    function getItemsByQuoteId(quoteId) {
        return quoteItems.value.filter(item => item.quoteId === quoteId);
    }

    /**
     * Creates a quote and its line items in a single workflow.
     * @param {Quote} quote - Quote entity to persist.
     * @param {QuoteItem[]} items - Line items to persist for the quote.
     * @returns {Promise<Quote|undefined>} The persisted quote, or undefined when persistence fails.
     */
    async function addQuote(quote, items) {
        try {
            const quoteResponse = await quotesApi.createQuote(quote);
            const persistedQuote = QuoteAssembler.toEntityFromResource(quoteResponse.data);
            quotes.value.push(persistedQuote);

            for (const item of items) {
                const itemResource = { ...item, quoteId: persistedQuote.id };
                const itemResponse = await quotesApi.createQuoteItem(itemResource);
                quoteItems.value.push(QuoteItemAssembler.toEntityFromResource(itemResponse.data));
            }

            return persistedQuote;
        } catch (error) {
            errors.value.push(error);
        }
    }

    /**
     * Updates an existing quote and synchronizes local state.
     * @param {Quote} quote - Quote entity with updated data.
     * @returns {void}
     */
    function updateQuote(quote) {
        quotesApi.updateQuote(quote).then(response => {
            const updated = QuoteAssembler.toEntityFromResource(response.data);
            const index = quotes.value.findIndex(q => q.id === updated.id);
            if (index !== -1) quotes.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a quote and removes it from the local state.
     * @param {Quote} quote - Quote entity to remove.
     * @returns {void}
     */
    function deleteQuote(quote) {
        quotesApi.deleteQuote(quote.id).then(() => {
            const index = quotes.value.findIndex(q => q.id === quote.id);
            if (index !== -1) quotes.value.splice(index, 1);
            quoteItems.value = quoteItems.value.filter(item => item.quoteId !== quote.id);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Computes the materials cost from a list of items.
     * @param {QuoteItem[]} items - Items to aggregate.
     * @returns {number} Sum of quantity × unitCost across all items.
     */
    function materialsCostOf(items) {
        return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    }

    /**
     * Computes the labor cost for a quote.
     * @param {Quote} quote - Quote whose labor cost is required.
     * @returns {number} laborHours × hourlyRate.
     */
    function laborCostOf(quote) {
        return quote.laborHours * quote.hourlyRate;
    }

    /**
     * Computes the full profitability breakdown for a quote and its items.
     * @param {Quote} quote - Quote being evaluated.
     * @param {QuoteItem[]} items - Items associated with the quote.
     * @returns {{materialsCost: number, laborCost: number, subtotal: number, profit: number, totalCost: number, marginPercent: number}} Cost breakdown.
     */
    function profitabilityOf(quote, items) {
        const materialsCost = materialsCostOf(items);
        const laborCost     = laborCostOf(quote);
        const subtotal      = materialsCost + laborCost;
        const profit        = subtotal * (quote.marginPercent / 100);
        const totalCost     = subtotal + profit;

        return {
            materialsCost,
            laborCost,
            subtotal,
            profit,
            totalCost,
            marginPercent: quote.marginPercent
        };
    }

    return {
        quotes,
        quoteItems,
        errors,
        quotesLoaded,
        quoteItemsLoaded,
        fetchQuotes,
        fetchQuoteItems,
        getQuoteById,
        getItemsByQuoteId,
        addQuote,
        updateQuote,
        deleteQuote,
        materialsCostOf,
        laborCostOf,
        profitabilityOf
    };
});

export default useQuotesStore;
