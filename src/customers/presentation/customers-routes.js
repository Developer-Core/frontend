const customerList = () => import('./views/customer-list.vue');
const customerForm = () => import('./views/customer-form.vue');

/**
 * Child routes exposed by the Customers presentation layer. Carpenter-only.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const customersRoutes = [
    { path: '',         name: 'customers-list', component: customerList, meta: { roles: ['Carpenter'] } },
    { path: 'new',      name: 'customers-new',  component: customerForm, meta: { titleKey: 'breadcrumb.customers-new',  roles: ['Carpenter'] } },
    { path: ':id/edit', name: 'customers-edit', component: customerForm, meta: { titleKey: 'breadcrumb.customers-edit', roles: ['Carpenter'] } }
];

export default customersRoutes;
