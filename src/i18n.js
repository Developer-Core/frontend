import en from './locales/en.json';
import es from './locales/es.json';
import { createI18n } from 'vue-i18n';

const STORAGE_KEY = 'woodroute.locale';
const SUPPORTED   = ['en', 'es'];

/**
 * Resolves the initial locale from local storage, falling back to English.
 * @returns {string} Initial locale code.
 */
function resolveInitialLocale() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return SUPPORTED.includes(stored) ? stored : 'en';
}

const i18n = createI18n({
    legacy: false,
    locale: resolveInitialLocale(),
    fallbackLocale: 'en',
    messages: { en, es }
});

export { STORAGE_KEY, SUPPORTED };
export default i18n;
