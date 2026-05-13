import { createRouter, createWebHistory } from 'vue-router';
import ordersRoutes from './orders/presentation/orders-routes.js';

const routes = [
    { path: '/',         redirect: '/orders' },
    { path: '/orders',   name: 'orders', children: ordersRoutes }
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
