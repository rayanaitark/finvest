<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()

const email = ref('')
const username = ref('')
const password = ref('')
const localError = ref('')
const successData = ref(null)

async function handleSubmit() {
  localError.value = ''
  successData.value = null

  if (!email.value || !username.value || !password.value) {
    localError.value = 'Tous les champs sont requis'
    return
  }

  if (password.value.length < 6) {
    localError.value = 'Le mot de passe doit faire au moins 6 caractères'
    return
  }

  try {
    const result = await auth.register({
      email: email.value,
      username: username.value,
      password: password.value,
    })
    successData.value = result
  } catch {
    // l'erreur est déjà dans auth.error
  }
}
</script>

<template>
  <div class="page">
    <div class="container auth-container">
      <div class="auth-card">
        <template v-if="!successData">
          <span class="eyebrow">— inscription</span>
          <h1 class="auth-title">Créez votre compte.</h1>
          <p class="lede">Trente secondes, c'est tout.</p>

          <form class="mt-4" @submit.prevent="handleSubmit">
            <div v-if="localError || auth.error" class="alert alert-error">
              {{ localError || auth.error }}
            </div>

            <div class="form-group">
              <label for="username" class="form-label">Nom d'utilisateur</label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-input"
                placeholder="stanislas"
                autocomplete="username"
                required
              />
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
                placeholder="6 caractères minimum"
                autocomplete="new-password"
                required
              />
              <p class="form-help">Un minimum de 6 caractères. On est pas chez une banque non plus.</p>
            </div>

            <button type="submit" class="btn btn-accent" style="width: 100%;" :disabled="auth.loading">
              <span v-if="auth.loading" class="loading"></span>
              {{ auth.loading ? 'Création…' : 'Créer mon compte' }}
            </button>
          </form>

          <p class="text-center mt-3 text-muted" style="font-size: 0.9rem;">
            Déjà un compte ?
            <RouterLink :to="{ name: 'login' }">Se connecter</RouterLink>
          </p>
        </template>

        <template v-else>
          <span class="eyebrow">— compte créé</span>
          <h1 class="auth-title">Presque fini.</h1>
          <p class="lede">Un email de validation a été envoyé à <strong>{{ successData.email }}</strong>.</p>

          <div class="alert alert-info mt-3">
            <strong>Mode dev :</strong> comme le SMTP n'est pas configuré, voici le lien de validation directement.
            Clique dessus pour activer ton compte.
          </div>

          <a
            v-if="successData.verificationUrl"
            :href="successData.verificationUrl"
            class="btn btn-accent mt-2"
            style="width: 100%;"
          >
            Valider mon email
          </a>
        </template>
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
