import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.js'

// On utilise localStorage pour persister le token entre les refreshs.
// C'est moins sécurisé que httpOnly cookie mais en cross-origin (Netlify/Render)

const STORAGE_KEY = 'finvest_token'

function loadToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // mode privé ou storage plein, tant pis
  }
}

function removeToken() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // idem
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const checked = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  // Au démarrage, on restaure le token depuis localStorage
  const savedToken = loadToken()
  if (savedToken) {
    api.setToken(savedToken)
  }

  async function checkAuth() {
    // On tente un appel à /users/me — si le token est valide, on récupère le user
    if (!api.getToken()) {
      checked.value = true
      return
    }

    try {
      const data = await api.getMe()
      user.value = data.user
    } catch {
      // Token expiré ou invalide
      user.value = null
      api.clearToken()
      removeToken()
    } finally {
      checked.value = true
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const data = await api.login(credentials)
      // Le backend renvoie le token dans la réponse
      if (data.token) {
        api.setToken(data.token)
        saveToken(data.token)
      }
      // Récupérer les infos du user
      await checkAuth()
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const data = await api.register(payload)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.logout()
    } catch {
      // On nettoie quand même
    }
    user.value = null
    api.clearToken()
    removeToken()
  }

  return {
    user,
    loading,
    error,
    checked,
    isAuthenticated,
    checkAuth,
    login,
    register,
    logout,
  }
})
