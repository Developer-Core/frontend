import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './shared/presentation/layouts/app-layout.vue';
import ordersRoutes from './orders/presentation/orders-routes.js';
import productionRoutes from './production/presentation/production-routes.js';
import inventoryRoutes from './inventory/presentation/inventory-routes.js';
import quotesRoutes from './quotes/presentation/quotes-routes.js';
import communicationRoutes from './communication/presentation/communication-routes.js';

const publicTracking = () => import('./orders/presentation/views/public-tracking.vue');

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            { path: '',              redirect: '/orders' },
            { path: 'orders',        name: 'orders',        meta: { title: 'Orders' },        children: ordersRoutes },
            { path: 'production',    name: 'production',    meta: { title: 'Production' },    children: productionRoutes },
            { path: 'inventory',     name: 'inventory',     meta: { title: 'Inventory' },     children: inventoryRoutes },
            { path: 'quotes',        name: 'quotes',        meta: { title: 'Quotes' },        children: quotesRoutes },
            { path: 'communication', name: 'communication', meta: { title: 'Messages' },      children: communicationRoutes }
        ]
    },
    { path: '/track/:id', name: 'public-tracking', component: publicTracking, meta: { title: 'Order Tracking' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * Global navigation guard that updates the document title.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Previous route.
 * @param {import('vue-router').NavigationGuardNext} next - Guard continuation callback.
 * @returns {void}
 */
router.beforeEach((to, from, next) => {
    const baseTitle = 'WoodRoute';
    document.title  = to.meta['title'] ? `${baseTitle} - ${to.meta['title']}` : baseTitle;
    return next();
});

export default router;
