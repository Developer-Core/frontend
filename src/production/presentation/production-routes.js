const productionTimeline = () => import('./views/production-timeline.vue');
const stageForm          = () => import('./views/stage-form.vue');

/**
 * Child routes exposed by the Production presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const productionRoutes = [
    { path: '',                           name: 'production-timeline',   component: productionTimeline, meta: { titleKey: 'breadcrumb.production' } },
    { path: 'orders/:orderId/stages/new', name: 'production-stage-new',  component: stageForm,          meta: { titleKey: 'breadcrumb.production-stage-new' } },
    { path: 'stages/:id/edit',            name: 'production-stage-edit', component: stageForm,          meta: { titleKey: 'breadcrumb.production-stage-edit' } }
];

export default productionRoutes;
