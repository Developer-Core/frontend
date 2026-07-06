const productionTimeline = () => import('./views/production-timeline.vue');

/**
 * Child routes exposed by the Production presentation layer. Stage management
 * (define / advance) happens inline in the timeline board, so there is no
 * separate stage form route.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const productionRoutes = [
    { path: '', name: 'production-timeline', component: productionTimeline, meta: { titleKey: 'breadcrumb.production' } }
];

export default productionRoutes;
