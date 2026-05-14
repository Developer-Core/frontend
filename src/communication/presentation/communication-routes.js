const conversationList   = () => import('./views/conversation-list.vue');
const conversationThread = () => import('./views/conversation-thread.vue');

/**
 * Child routes exposed by the Communication presentation layer.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const communicationRoutes = [
    { path: '',    name: 'communication-list',   component: conversationList,   meta: { titleKey: 'breadcrumb.communication' } },
    { path: ':id', name: 'communication-thread', component: conversationThread, meta: { titleKey: 'breadcrumb.communication-thread' } }
];

export default communicationRoutes;
