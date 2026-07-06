const signInForm          = () => import('./views/sign-in-form.vue');
const signUpForm          = () => import('./views/sign-up-form.vue');
const signUpCarpenterForm = () => import('./views/sign-up-carpenter-form.vue');

/**
 * Top-level authentication routes (`/login`, `/register`, `/register-carpenter`).
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const iamRoutes = [
    { path: '/login',              name: 'login',              component: signInForm,          meta: { titleKey: 'breadcrumb.login',              public: true } },
    { path: '/register',           name: 'register',           component: signUpForm,          meta: { titleKey: 'breadcrumb.register',           public: true } },
    { path: '/register-carpenter', name: 'register-carpenter', component: signUpCarpenterForm, meta: { titleKey: 'breadcrumb.register-carpenter', public: true } }
];

export default iamRoutes;
