<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const localError = ref('')

async function handleSubmit() {
  localError.value = ''
  if (!email.value || !password.value) {
    localError.value = 'Tous les champs sont requis'
    return
  }

  const ok = await auth.login({
    email: email.value,
    password: password.value,
  })

  if (ok) {
    // On respecte la redirection si présente (quand le guard a renvoyé ici)
    const redirect = route.query.redirect || { name: 'dashboard' }
    router.push(redirect)
  }
}
</script>

<template>
  <div class="page">
    <div class="container auth-container">
      <div class="auth-card">
        <span class="eyebrow">— connexion</span>
        <h1 class="auth-title">Bon retour.</h1>
        <p class="lede">Connectez-vous pour retrouver vos simulations.</p>

        <form class="mt-4" @submit.prevent="handleSubmit">
          <div v-if="localError || auth.error" class="alert alert-error">
            {{ localError || auth.error }}
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="vous@exemple.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>

          <button type="submit" class="btn btn-accent" style="width: 100%;" :disabled="auth.loading">
            <span v-if="auth.loading" class="loading"></span>
            {{ auth.loading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center mt-3 text-muted" style="font-size: 0.9rem;">
          Pas encore de compte ?
          <RouterLink :to="{ name: 'register' }">Créer un compte</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 480px;
  padding-top: 3rem;
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

@media (max-width: 600px) {
  .auth-card { padding: 2rem 1.5rem; }
}
</style>
