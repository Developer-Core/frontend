const orderList     = () => import('./views/order-list.vue');
const orderForm     = () => import('./views/order-form.vue');
const orderTracking = () => import('./views/order-tracking.vue');

/**
 * Child routes exposed by the Orders presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const ordersRoutes = [
    { path: '',             name: 'orders-list',     component: orderList,     meta: { titleKey: 'breadcrumb.orders' } },
    { path: 'new',          name: 'orders-new',      component: orderForm,     meta: { titleKey: 'breadcrumb.orders-new' } },
    { path: ':id/edit',     name: 'orders-edit',     component: orderForm,     meta: { titleKey: 'breadcrumb.orders-edit' } },
    { path: ':id/tracking', name: 'orders-tracking', component: orderTracking, meta: { titleKey: 'breadcrumb.orders-tracking' } }
];

export default ordersRoutes;
