<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import * as api from '../services/api.js'
import SimulationChart from '../components/SimulationChart.vue'
import { formatEUR, formatPct, formatDate } from '../composables/useFormat.js'
import { useSimulationsStore } from '../stores/simulations.js'

const route = useRoute()
const router = useRouter()
const store = useSimulationsStore()

const simulation = ref(null)
const breakdown = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await api.getSimulation(route.params.id)
    simulation.value = data.simulation
    breakdown.value = data.breakdown
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

async function handleDelete() {
  if (!confirm(`Supprimer définitivement "${simulation.value.name}" ?`)) return
  try {
    await store.remove(simulation.value._id)
    router.push({ name: 'dashboard' })
  } catch {
    alert('Erreur lors de la suppression')
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <div v-if="loading" class="card">
        <div class="skeleton" style="height: 40px; width: 60%; margin-bottom: 1rem;"></div>
        <div class="skeleton" style="height: 300px;"></div>
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
        <RouterLink :to="{ name: 'dashboard' }" class="btn btn-outline btn-sm mt-2">
          Retour au dashboard
        </RouterLink>
      </div>

      <template v-else-if="simulation">
        <RouterLink :to="{ name: 'dashboard' }" class="back-link">
          ← Retour au dashboard
        </RouterLink>

        <header class="page-header">
          <span class="eyebrow">— simulation · créée le {{ formatDate(simulation.createdAt) }}</span>
          <div class="flex-between">
            <h1>{{ simulation.name }}</h1>
            <button class="btn btn-danger btn-sm" @click="handleDelete">
              Supprimer
            </button>
          </div>
        </header>

        <!-- Résumé -->
        <section class="grid-4 mb-4">
          <div class="stat">
            <span class="stat-label">Capital initial</span>
            <span class="stat-value num">{{ formatEUR(simulation.initialCapital) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Versements / mois</span>
            <span class="stat-value num">{{ formatEUR(simulation.monthlyContribution) }}</span>
            <span class="stat-sub">pendant {{ simulation.durationYears }} ans</span>
          </div>
          <div class="stat">
            <span class="stat-label">Taux annuel</span>
            <span class="stat-value num">{{ formatPct(simulation.annualRate) }}</span>
          </div>
          <div class="stat" style="background: var(--accent-soft); border-color: var(--accent);">
            <span class="stat-label">Capital final</span>
            <span class="stat-value num" style="color: var(--accent);">
              {{ formatEUR(simulation.finalCapital) }}
            </span>
            <span class="stat-sub">
              dont <strong>+{{ formatEUR(simulation.totalInterest) }}</strong> d'intérêts
            </span>
          </div>
        </section>

        <!-- Graphique -->
        <section class="card mb-4">
          <h3 class="mb-3">Évolution du capital</h3>
          <SimulationChart :breakdown="breakdown" />
        </section>

        <!-- Tableau année par année -->
        <section class="card">
          <h3 class="mb-3">Détail année par année</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Année</th>
                  <th class="text-right">Versé cumulé</th>
                  <th class="text-right">Intérêts cumulés</th>
                  <th class="text-right">Capital total</th>
                  <th class="text-right">% d'intérêts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in breakdown" :key="row.year">
                  <td class="mono">An {{ row.year }}</td>
                  <td class="text-right num">{{ formatEUR(row.totalContributed) }}</td>
                  <td class="text-right num text-accent">{{ formatEUR(row.totalInterest) }}</td>
                  <td class="text-right num" style="font-weight: 600;">{{ formatEUR(row.balance) }}</td>
                  <td class="text-right num text-muted">
                    {{ ((row.totalInterest / (row.balance || 1)) * 100).toFixed(1) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  border: none;
  color: var(--ink-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: var(--accent);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--rule);
  text-align: left;
  font-size: 0.9rem;
}

.data-table th {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-muted);
  font-weight: 600;
  background: var(--cream-dark);
}

.data-table tbody tr:hover {
  background: var(--cream-dark);
}

.text-right { text-align: right !important; }
</style>
