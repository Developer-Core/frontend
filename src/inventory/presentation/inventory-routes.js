const materialList = () => import('./views/material-list.vue');
const materialForm = () => import('./views/material-form.vue');

/**
 * Child routes exposed by the Inventory presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const inventoryRoutes = [
    { path: '',         name: 'inventory-list',          component: materialList, meta: { titleKey: 'breadcrumb.inventory' } },
    { path: 'new',      name: 'inventory-material-new',  component: materialForm, meta: { titleKey: 'breadcrumb.inventory-material-new' } },
    { path: ':id/edit', name: 'inventory-material-edit', component: materialForm, meta: { titleKey: 'breadcrumb.inventory-material-edit' } }
];

export default inventoryRoutes;
