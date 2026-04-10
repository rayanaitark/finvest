<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <RouterLink :to="{ name: 'home' }" class="navbar-brand">
        FinVest
      </RouterLink>

      <ul class="navbar-links">
        <template v-if="auth.isAuthenticated">
          <li><RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink></li>
          <li><RouterLink :to="{ name: 'simulation-new' }">Nouvelle simulation</RouterLink></li>
          <li>
            <button class="btn btn-ghost btn-sm" @click="handleLogout">
              Déconnexion
            </button>
          </li>
        </template>
        <template v-else>
          <li><RouterLink :to="{ name: 'login' }">Connexion</RouterLink></li>
          <li>
            <RouterLink :to="{ name: 'register' }" class="btn btn-accent btn-sm">
              S'inscrire
            </RouterLink>
          </li>
        </template>
      </ul>
    </div>
  </nav>

  <main>
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>

  <footer class="footer">
    <div class="container footer-inner">
      <span>FinVest · Projet ESILV Fintech — 2026</span>
      <span class="mono" style="font-size: 0.75rem;">v1.0.0</span>
    </div>
  </footer>
</template>
