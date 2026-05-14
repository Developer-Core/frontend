const quoteList   = () => import('./views/quote-list.vue');
const quoteWizard = () => import('./views/quote-wizard.vue');

/**
 * Child routes exposed by the Quotes presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const quotesRoutes = [
    { path: '',    name: 'quotes-list', component: quoteList,   meta: { title: 'Quotes' } },
    { path: 'new', name: 'quotes-new',  component: quoteWizard, meta: { title: 'New Quote' } }
];

export default quotesRoutes;
