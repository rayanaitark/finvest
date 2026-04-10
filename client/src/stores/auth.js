import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  // Permet de savoir si on a déjà tenté un checkAuth (pour éviter des flashs au reload)
  const checked = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function checkAuth() {
    // On appelle /users/me pour voir si le cookie est encore valide
    try {
      const data = await api.getMe()
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      await api.login(credentials)
      // Après le login, on récupère le user
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
      return data // contient verificationUrl en dev
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
      // On s'en fout si ça échoue, on nettoie quand même
    }
    user.value = null
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
