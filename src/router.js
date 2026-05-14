import { createRouter, createWebHistory } from 'vue-router';
import ordersRoutes from './orders/presentation/orders-routes.js';
import productionRoutes from './production/presentation/production-routes.js';
import inventoryRoutes from './inventory/presentation/inventory-routes.js';
import quotesRoutes from './quotes/presentation/quotes-routes.js';
import communicationRoutes from './communication/presentation/communication-routes.js';

const publicTracking = () => import('./orders/presentation/views/public-tracking.vue');

const routes = [
    { path: '/',              redirect: '/orders' },
    { path: '/orders',        name: 'orders',        children: ordersRoutes },
    { path: '/production',    name: 'production',    children: productionRoutes },
    { path: '/inventory',     name: 'inventory',     children: inventoryRoutes },
    { path: '/quotes',        name: 'quotes',        children: quotesRoutes },
    { path: '/communication', name: 'communication', children: communicationRoutes },
    { path: '/track/:id',     name: 'public-tracking', component: publicTracking, meta: { title: 'Order Tracking' } }
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
