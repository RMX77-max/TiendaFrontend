const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/inventario' },
      {
        path: 'inicio',
        component: () => import('pages/DashboardPage.vue'),
        meta: {
          allowedRoles: ['gerente', 'auxiliar_administrativo']
        }
      },
      {
        path: 'usuarios',
        component: () => import('pages/UsuariosPage.vue'),
        meta: {
          allowedRoles: ['gerente']
        }
      },
      {
        path: 'productos',
        component: () => import('pages/ProductosPage.vue'),
        meta: {
          allowedRoles: ['gerente', 'auxiliar_administrativo']
        }
      },
      {
        path: 'inventario',
        component: () => import('pages/InventarioPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
