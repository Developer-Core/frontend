import i18n from '../../i18n.js';

/**
 * Toast bridge for the presentation layer.
 *
 * Stores the PrimeVue toast instance so that Pinia stores — which run outside a
 * component setup context and therefore cannot call `useToast()` — can still
 * surface feedback. Messages are translated through the global vue-i18n instance.
 *
 * @module app-toast
 */

/** @type {?import('primevue/usetoast').ToastServiceMethods} Registered toast instance. */
let toast = null;

/**
 * Registers the toast instance. Must be called once from the root component.
 * @param {import('primevue/usetoast').ToastServiceMethods} instance - Toast service.
 */
export function setAppToast(instance) {
    toast = instance;
}

/**
 * Translates a message key with the global i18n instance.
 * @param {string} key - i18n message key.
 * @param {Object} [params] - Interpolation params.
 * @returns {string} Translated message.
 */
const t = (key, params) => i18n.global.t(key, params ?? {});

/**
 * Shows a success toast.
 * @param {string} messageKey - i18n key for the detail message.
 * @param {Object} [params] - Interpolation params.
 */
export function notifySuccess(messageKey, params) {
    toast?.add({ severity: 'success', summary: t('toast.success-title'), detail: t(messageKey, params), life: 3000 });
}

/**
 * Shows an error toast.
 * @param {string} messageKey - i18n key for the detail message.
 * @param {Object} [params] - Interpolation params.
 */
export function notifyError(messageKey, params) {
    toast?.add({ severity: 'error', summary: t('toast.error-title'), detail: t(messageKey, params), life: 4000 });
}
