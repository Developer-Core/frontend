const orderList     = () => import('./views/order-list.vue');
const orderForm     = () => import('./views/order-form.vue');
const orderTracking = () => import('./views/order-tracking.vue');

/**
 * Child routes exposed by the Orders presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const ordersRoutes = [
    { path: '',              name: 'orders-list',     component: orderList,     meta: { title: 'Orders' } },
    { path: 'new',           name: 'orders-new',      component: orderForm,     meta: { title: 'New Order' } },
    { path: ':id/edit',      name: 'orders-edit',     component: orderForm,     meta: { title: 'Edit Order' } },
    { path: ':id/tracking',  name: 'orders-tracking', component: orderTracking, meta: { title: 'Order Tracking' } }
];

export default ordersRoutes;
