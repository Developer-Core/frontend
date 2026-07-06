import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from './shared/presentation/layouts/app-layout.vue';
import i18n from './i18n.js';
import ordersRoutes from './orders/presentation/orders-routes.js';
import productionRoutes from './production/presentation/production-routes.js';
import inventoryRoutes from './inventory/presentation/inventory-routes.js';
import communicationRoutes from './communication/presentation/communication-routes.js';
import iamRoutes from './iam/presentation/iam-routes.js';
import { authenticationGuard } from './iam/infrastructure/authentication.guard.js';

const publicTracking = () => import('./orders/presentation/views/public-tracking.vue');
const notFound       = () => import('./shared/presentation/views/not-found.vue');

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            { path: '',                   redirect: { name: 'orders-list' } },
            { path: 'orders',             name: 'orders',        meta: { titleKey: 'breadcrumb.orders' },                                    children: ordersRoutes },
            { path: 'production',         name: 'production',    meta: { titleKey: 'breadcrumb.production', roles: ['Carpenter'] },          children: productionRoutes },
            { path: 'inventory',          name: 'inventory',     meta: { titleKey: 'breadcrumb.inventory',  roles: ['Carpenter'] },          children: inventoryRoutes },
            { path: 'communication',      name: 'communication', meta: { titleKey: 'breadcrumb.communication' },                             children: communicationRoutes },
            { path: ':pathMatch(.*)*',    name: 'not-found',     component: notFound,                            meta: { titleKey: 'breadcrumb.not-found' } }
        ]
    },
    ...iamRoutes,
    { path: '/track/:id?', name: 'public-tracking', component: publicTracking, meta: { titleKey: 'breadcrumb.public-tracking', public: true } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * Global navigation guard that updates the document title from the route's translation key.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Previous route.
 * @param {import('vue-router').NavigationGuardNext} next - Guard continuation callback.
 * @returns {void}
 */
router.beforeEach((to, from, next) => {
    const baseTitle = 'WoodRoute';
    const key       = to.meta['titleKey'];
    const section   = key ? i18n.global.t(key) : null;
    document.title  = section ? `${baseTitle} - ${section}` : baseTitle;
    return authenticationGuard(to, from, next);
});

export default router;
