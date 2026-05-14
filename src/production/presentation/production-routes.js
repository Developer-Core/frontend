const productionTimeline = () => import('./views/production-timeline.vue');
const stageForm          = () => import('./views/stage-form.vue');

/**
 * Child routes exposed by the Production presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const productionRoutes = [
    { path: '',                          name: 'production-timeline',  component: productionTimeline, meta: { title: 'Production' } },
    { path: 'orders/:orderId/stages/new', name: 'production-stage-new', component: stageForm,         meta: { title: 'New Stage' } },
    { path: 'stages/:id/edit',           name: 'production-stage-edit', component: stageForm,         meta: { title: 'Edit Stage' } }
];

export default productionRoutes;
