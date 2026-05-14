const materialList = () => import('./views/material-list.vue');
const materialForm = () => import('./views/material-form.vue');

/**
 * Child routes exposed by the Inventory presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const inventoryRoutes = [
    { path: '',         name: 'inventory-list',          component: materialList, meta: { title: 'Inventory' } },
    { path: 'new',      name: 'inventory-material-new',  component: materialForm, meta: { title: 'New Material' } },
    { path: ':id/edit', name: 'inventory-material-edit', component: materialForm, meta: { title: 'Edit Material' } }
];

export default inventoryRoutes;
