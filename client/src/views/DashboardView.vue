<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSimulationsStore } from '../stores/simulations.js'
import { useAuthStore } from '../stores/auth.js'
import { formatEUR, formatDate, formatPct } from '../composables/useFormat.js'

const store = useSimulationsStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchAll()
})

async function handleDelete(sim) {
  // Confirmation simple avec confirm() — on pourrait faire une modal mais
  // pour un projet étudiant, ça fait le taf.
  if (!confirm(`Supprimer la simulation "${sim.name}" ?`)) return
  try {
    await store.remove(sim._id)
  } catch {
    alert('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <span class="eyebrow">— tableau de bord</span>
        <h1>Bonjour, <em>{{ auth.user?.username || 'toi' }}</em>.</h1>
        <p class="lede">Voici un aperçu de tes projections d'investissement.</p>
      </header>

      <!-- Stats globales -->
      <section class="grid-4 mb-4">
        <div class="stat">
          <span class="stat-label">Simulations</span>
          <span class="stat-value num">{{ store.totalSimulations }}</span>
          <span class="stat-sub">enregistrées</span>
        </div>
        <div class="stat">
          <span class="stat-label">Capital projeté</span>
          <span class="stat-value num">{{ formatEUR(store.totalProjectedCapital) }}</span>
          <span class="stat-sub">total cumulé</span>
        </div>
        <div class="stat">
          <span class="stat-label">Intérêts générés</span>
          <span class="stat-value num text-accent">{{ formatEUR(store.totalInterestEarned) }}</span>
          <span class="stat-sub">sur toutes les simulations</span>
        </div>
        <div class="stat">
          <span class="stat-label">Meilleure simulation</span>
          <span class="stat-value" style="font-size: 1.1rem;">
            {{ store.bestSimulation?.name || '—' }}
          </span>
          <span class="stat-sub">
            <template v-if="store.bestSimulation">
              +{{ formatEUR(store.bestSimulation.totalInterest) }}
            </template>
          </span>
        </div>
      </section>

      <!-- Liste -->
      <section>
        <div class="flex-between mb-3">
          <h2>Tes simulations</h2>
          <RouterLink :to="{ name: 'simulation-new' }" class="btn btn-primary btn-sm">
            + Nouvelle simulation
          </RouterLink>
        </div>

        <div v-if="store.loading && store.simulations.length === 0" class="card">
          <div class="skeleton" style="height: 80px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="height: 80px;"></div>
        </div>

        <div v-else-if="store.error" class="alert alert-error">
          {{ store.error }}
        </div>

        <div v-else-if="store.simulations.length === 0" class="empty-state card text-center">
          <h3>Aucune simulation pour l'instant</h3>
          <p class="text-muted mb-3">Lancez votre première projection pour voir la magie des intérêts composés.</p>
          <RouterLink :to="{ name: 'simulation-new' }" class="btn btn-accent">
            Créer ma première simulation
          </RouterLink>
        </div>

        <div v-else class="sim-list">
          <article v-for="sim in store.simulations" :key="sim._id" class="sim-card">
            <div class="sim-card-main">
              <div>
                <h3>
                  <RouterLink :to="{ name: 'simulation-detail', params: { id: sim._id } }">
                    {{ sim.name }}
                  </RouterLink>
                </h3>
                <p class="sim-meta">
                  {{ formatEUR(sim.initialCapital) }} initial ·
                  {{ formatEUR(sim.monthlyContribution) }}/mois ·
                  {{ formatPct(sim.annualRate) }} sur {{ sim.durationYears }} ans
                </p>
                <p class="text-muted" style="font-size: 0.8rem;">
                  Créée le {{ formatDate(sim.createdAt) }}
                </p>
              </div>

              <div class="sim-result">
                <span class="stat-label">Capital final</span>
                <span class="sim-result-value num">{{ formatEUR(sim.finalCapital) }}</span>
                <span class="text-accent mono" style="font-size: 0.85rem;">
                  +{{ formatEUR(sim.totalInterest) }} d'intérêts
                </span>
              </div>
            </div>
            <div class="sim-actions">
              <RouterLink
                :to="{ name: 'simulation-detail', params: { id: sim._id } }"
                class="btn btn-ghost btn-sm"
              >
                Voir le détail
              </RouterLink>
              <button class="btn btn-danger btn-sm" @click="handleDelete(sim)">
                Supprimer
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
h1 em {
  font-style: italic;
  color: var(--accent);
}

.sim-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sim-card {
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.sim-card:hover {
  border-color: var(--accent);
}

.sim-card-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1rem;
}

.sim-card h3 {
  margin-bottom: 0.5rem;
}

.sim-card h3 a {
  color: var(--ink);
  border: none;
}

.sim-card h3 a:hover {
  color: var(--accent);
}

.sim-meta {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-bottom: 0.25rem;
}

.sim-result {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.sim-result-value {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ink);
}

.sim-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--rule);
}

.empty-state {
  padding: 3rem 2rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

@media (max-width: 700px) {
  .sim-card-main { flex-direction: column; gap: 1rem; }
  .sim-result { text-align: left; }
}
</style>
