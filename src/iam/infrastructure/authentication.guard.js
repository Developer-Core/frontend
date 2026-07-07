import useIamStore from '../application/iam.store.js';

/**
 * Resolves the safe home route for a given role. Both roles share the orders
 * section, so it doubles as the fallback when a user hits a route they are not
 * authorized for (navigation-level 403).
 *
 * @param {?string} role - Current user role ('Carpenter' | 'Client').
 * @returns {{name: string}} Route location to redirect to.
 */
const homeRouteForRole = (role) => {
    void role; // Both roles currently land on the shared orders home.
    return { name: 'orders-list' };
};

/**
 * Navigation guard that protects application routes from anonymous users and
 * enforces role-based access.
 *
 * Rules, in order:
 * 1. Routes flagged with `meta.public` (sign-in, sign-up) and the public order
 *    tracking page (`/track/...`) are always reachable.
 * 2. An anonymous user hitting a protected route is sent to `login`.
 * 3. A signed-in user landing on an auth page is sent to the app home.
 * 4. A signed-in user hitting a route whose `meta.roles` array does not include
 *    their role is redirected to their role home (a navigation-level 403, not a
 *    re-authentication).
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Current route.
 * @param {import('vue-router').NavigationGuardNext} next - Guard continuation callback.
 * @returns {void}
 */
export const authenticationGuard = (to, from, next) => {
    const store = useIamStore();
    const isTrackingRoute = to.path === '/track' || to.path.startsWith('/track/');
    const isPublic = to.meta.public === true || isTrackingRoute;

    if (!store.isSignedIn && !isPublic) {
        return next({ name: 'login' });
    }
    // A signed-in user landing on an auth page is sent to the app home.
    if (store.isSignedIn && to.meta.public === true && !isTrackingRoute) {
        return next(homeRouteForRole(store.currentRole));
    }
    // Role-based access: routes may restrict themselves via `meta.roles`. Match
    // against the nearest ancestor that declares them so child routes inherit.
    if (store.isSignedIn) {
        const restricted = to.matched.find(record => Array.isArray(record.meta?.roles));
        if (restricted && !restricted.meta.roles.includes(store.currentRole)) {
            return next(homeRouteForRole(store.currentRole));
        }
    }
    return next();
};
