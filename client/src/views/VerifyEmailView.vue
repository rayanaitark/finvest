<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import * as api from '../services/api.js'

const route = useRoute()
const status = ref('pending') // 'pending' | 'success' | 'error'
const message = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    status.value = 'error'
    message.value = 'Token manquant dans l\'URL.'
    return
  }

  try {
    const data = await api.verifyEmail(token)
    status.value = 'success'
    message.value = data.message
  } catch (err) {
    status.value = 'error'
    message.value = err.message
  }
})
</script>

<template>
  <div class="page">
    <div class="container auth-container">
      <div class="auth-card text-center">
        <template v-if="status === 'pending'">
          <span class="eyebrow">— validation en cours</span>
          <h1 class="auth-title">Un instant…</h1>
          <p class="text-muted"><span class="loading"></span> On vérifie votre token.</p>
        </template>

        <template v-else-if="status === 'success'">
          <div class="icon-check">✓</div>
          <h1 class="auth-title">Email validé !</h1>
          <p class="lede">{{ message }}</p>
          <RouterLink :to="{ name: 'login' }" class="btn btn-accent mt-3">
            Me connecter
          </RouterLink>
        </template>

        <template v-else>
          <div class="icon-cross">×</div>
          <h1 class="auth-title">Validation échouée</h1>
          <p class="alert alert-error mt-2">{{ message }}</p>
          <RouterLink :to="{ name: 'register' }" class="btn btn-outline mt-3">
            Retour à l'inscription
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 480px;
  padding-top: 4rem;
}

.auth-card {
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  padding: 3rem;
  box-shadow: var(--shadow-card);
}

.auth-title {
  font-size: 2.25rem;
  margin: 0.5rem 0 0.5rem;
}

.icon-check,
.icon-cross {
  font-size: 3rem;
  width: 72px;
  height: 72px;
  line-height: 72px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  font-family: var(--font-display);
  font-weight: 700;
}

.icon-check {
  background: var(--accent-soft);
  color: var(--accent);
}

.icon-cross {
  background: var(--danger-soft);
  color: var(--danger);
}
</style>
