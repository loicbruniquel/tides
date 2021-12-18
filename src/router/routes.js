
const routes = [

  {
    path: '/',
    component: () => import('layouts/Main.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/Index.vue') },

      { path: 'user/login', component: () => import('pages/user/Login.vue') },
      { path: 'user/register', component: () => import('pages/user/Register.vue') },

      { path: 'stations/:stationId/tides', component: () => import('pages/stations/View.vue') }
    ]
  },

  {
    path: '/',
    component: () => import('layouts/FullScreen.vue'),
    children: [
      { path: 'stations/new', component: () => import('pages/stations/New.vue') },
      { path: 'stations/:stationId/edit', component: () => import('pages/stations/Edit.vue') }
    ]
  }

]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
