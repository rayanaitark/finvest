// Petit wrapper autour de fetch.
// J'aurais pu utiliser axios mais pour un projet de cette taille, fetch suffit
// et ça évite une dépendance en plus.
//
// En dev, on passe par le proxy Vite (/api → localhost:3000)
// En prod, on pointe directement sur l'URL Render via VITE_API_URL.

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // Nécessaire pour envoyer/recevoir le cookie JWT
    ...options,
  }

  let response
  try {
    response = await fetch(url, config)
  } catch (err) {
    // Problème réseau, serveur down, etc.
    throw new Error('Impossible de joindre le serveur')
  }

  // Certaines routes renvoient du vide (DELETE), on protège le parse
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
