import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulations/new',
      name: 'simulation-new',
      component: () => import('../views/NewSimulationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulations/:id',
      name: 'simulation-detail',
      component: () => import('../views/SimulationDetailView.vue'),
      meta: { requiresAuth: true },
    },
    // Fallback 404 : on redirige vers l'accueil (simple mais suffisant ici)
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Guard : on vérifie l'auth avant les routes protégées
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Première navigation : on tente de récupérer le user via le cookie
  if (!auth.checked) {
    await auth.checkAuth()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
