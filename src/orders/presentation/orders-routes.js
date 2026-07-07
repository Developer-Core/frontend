const orderList     = () => import('./views/order-list.vue');
const orderForm     = () => import('./views/order-form.vue');
const orderTracking = () => import('./views/order-tracking.vue');
const poolList      = () => import('./views/pool-list.vue');

/**
 * Child routes exposed by the Orders presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const ordersRoutes = [
    { path: '',             name: 'orders-list',     component: orderList },
    { path: 'pool',         name: 'orders-pool',     component: poolList,      meta: { titleKey: 'breadcrumb.orders-pool', roles: ['Carpenter'] } },
    { path: 'new',          name: 'orders-new',      component: orderForm,     meta: { titleKey: 'breadcrumb.orders-new' } },
    { path: ':id/edit',     name: 'orders-edit',     component: orderForm,     meta: { titleKey: 'breadcrumb.orders-edit' } },
    { path: ':id/tracking', name: 'orders-tracking', component: orderTracking, meta: { titleKey: 'breadcrumb.orders-tracking' } }
];

export default ordersRoutes;
