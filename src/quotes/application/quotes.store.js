/**
 * Application service store for the `Quotes` bounded context.
 * It coordinates quote and quote-item use cases and exposes profitability calculations.
 *
 * @module useQuotesStore
 * @returns {Object} Store state and actions.
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { QuotesApi } from '../infrastructure/quotes-api.js';
import { QuoteAssembler } from '../infrastructure/quote.assembler.js';
import { QuoteItemAssembler } from '../infrastructure/quote-item.assembler.js';

const quotesApi = new QuotesApi();

const useQuotesStore = defineStore('quotes', () => {
    /** @type {import('vue').Ref<Array<import('../domain/quote.entity.js').Quote>>} List of quote entities. */
    const quotes = ref([]);
    /** @type {import('vue').Ref<Array<import('../domain/quote-item.entity.js').QuoteItem>>} List of quote-item entities. */
    const quoteItems = ref([]);
    /** @type {import('vue').Ref<Array<Error>>} Errors raised by Quotes use-case execution. */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} Flag indicating if quotes have been loaded. */
    const quotesLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} Flag indicating if quote items have been loaded. */
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
     * @returns {import('../domain/quote.entity.js').Quote|undefined} Matching quote, if available.
     */
    function getQuoteById(id) {
        const idNum = parseInt(id);
        return quotes.value.find(quote => quote.id === idNum);
    }

    /**
     * Returns the items that belong to a quote.
     * @param {number} quoteId - Quote identifier.
     * @returns {Array<import('../domain/quote-item.entity.js').QuoteItem>} Items related to the quote.
     */
    function getItemsByQuoteId(quoteId) {
        return quoteItems.value.filter(item => item.quoteId === quoteId);
    }

    /**
     * Creates a quote and its line items in a single workflow.
     * @param {import('../domain/quote.entity.js').Quote} quote - Quote entity to persist.
     * @param {Array<import('../domain/quote-item.entity.js').QuoteItem>} items - Line items to persist for the quote.
     * @returns {Promise<import('../domain/quote.entity.js').Quote|undefined>} The persisted quote, or undefined when persistence fails.
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
     * @param {import('../domain/quote.entity.js').Quote} quote - Quote entity with updated data.
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
     * @param {import('../domain/quote.entity.js').Quote} quote - Quote entity to remove.
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
     * @param {Array<import('../domain/quote-item.entity.js').QuoteItem>} items - Items to aggregate.
     * @returns {number} Sum of quantity × unitCost across all items.
     */
    function materialsCostOf(items) {
        return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    }

    /**
     * Computes the labor cost for a quote.
     * @param {import('../domain/quote.entity.js').Quote} quote - Quote whose labor cost is required.
     * @returns {number} laborHours × hourlyRate.
     */
    function laborCostOf(quote) {
        return quote.laborHours * quote.hourlyRate;
    }

    /**
     * Computes the full profitability breakdown for a quote and its items.
     * @param {import('../domain/quote.entity.js').Quote} quote - Quote being evaluated.
     * @param {Array<import('../domain/quote-item.entity.js').QuoteItem>} items - Items associated with the quote.
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
