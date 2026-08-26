import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// A single file rather than a `router/` directory, so it cannot be confused with the
// legacy `src/router/index.js` while both trees coexist.
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'stations',
    component: () => import('@/views/StationsView.vue'),
    meta: { title: 'Stations' },
  },
  {
    path: '/stations/new',
    name: 'station-new',
    component: () => import('@/views/StationEditorView.vue'),
    meta: { title: 'New station', chrome: false },
  },
  {
    path: '/stations/:id',
    name: 'station',
    component: () => import('@/views/StationView.vue'),
    meta: { title: 'Tides' },
  },
  {
    path: '/stations/:id/edit',
    name: 'station-edit',
    component: () => import('@/views/StationEditorView.vue'),
    meta: { title: 'Edit station', chrome: false },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
