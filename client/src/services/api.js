// Wrapper autour de fetch.
// Le token JWT est stocké en mémoire (pas en localStorage pour la sécu).
// En dev local, le cookie marche aussi (same-origin via proxy Vite).
// En prod (Netlify → Render, cross-origin), on envoie le token via Authorization header.

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Token JWT en mémoire — perdu au refresh de la page, c'est voulu
let authToken = null

export function setToken(token) {
  authToken = token
}

export function clearToken() {
  authToken = null
}

export function getToken() {
  return authToken
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Si on a un token, on l'envoie dans le header Authorization
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const config = {
    headers,
    credentials: 'include', // On garde le cookie en fallback (dev local)
    ...options,
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (err) {
    throw new Error('Impossible de joindre le serveur')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error || `Erreur ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

// ---------- Auth ----------

export function register({ email, username, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function resendVerification(email) {
  return request('/auth/resend-verification-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyEmail(token) {
  return request(`/users/verify-email?token=${encodeURIComponent(token)}`)
}

export function getMe() {
  return request('/users/me')
}

// ---------- Simulations ----------

export function getSimulations() {
  return request('/simulations')
}

export function getSimulation(id) {
  return request(`/simulations/${id}`)
}

export function createSimulation(payload) {
  return request('/simulations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteSimulation(id) {
  return request(`/simulations/${id}`, { method: 'DELETE' })
}

export function previewSimulation(payload) {
  return request('/simulations/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
