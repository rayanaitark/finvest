<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationsStore } from '../stores/simulations.js'
import SimulationChart from '../components/SimulationChart.vue'
import * as api from '../services/api.js'
import { formatEUR, formatPct } from '../composables/useFormat.js'

const router = useRouter()
const store = useSimulationsStore()

// Valeurs par défaut réalistes pour guider l'utilisateur
const form = reactive({
  name: '',
  initialCapital: 5000,
  monthlyContribution: 200,
  annualRate: 5,
  durationYears: 20,
})

const preview = ref(null)
const previewLoading = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

// Debounce simple pour pas spammer le backend à chaque frappe
let debounceTimer = null

async function fetchPreview() {
  // Validation minimale avant d'appeler
  if (form.initialCapital == null || form.annualRate == null || !form.durationYears) {
    preview.value = null
    return
  }

  previewLoading.value = true
  try {
    const data = await api.previewSimulation({
      initialCapital: Number(form.initialCapital),
      monthlyContribution: Number(form.monthlyContribution) || 0,
      annualRate: Number(form.annualRate),
      durationYears: Number(form.durationYears),
    })
    preview.value = data
  } catch {
    preview.value = null
  } finally {
    previewLoading.value = false
  }
}

watch(
  () => [form.initialCapital, form.monthlyContribution, form.annualRate, form.durationYears],
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchPreview, 250)
  },
  { immediate: true },
)

async function handleSubmit() {
  errorMsg.value = ''

  if (!form.name.trim()) {
    errorMsg.value = 'Donnez un nom à votre simulation'
    return
  }

  submitting.value = true
  try {
    const sim = await store.create({
      name: form.name.trim(),
      initialCapital: Number(form.initialCapital),
      monthlyContribution: Number(form.monthlyContribution) || 0,
      annualRate: Number(form.annualRate),
      durationYears: Number(form.durationYears),
    })
    // Redirection vers la page de détail
    router.push({ name: 'simulation-detail', params: { id: sim._id } })
  } catch (err) {
    errorMsg.value = err.message || 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <span class="eyebrow">— nouvelle simulation</span>
        <h1>Une nouvelle projection.</h1>
        <p class="lede">Ajustez les curseurs, la courbe bouge en temps réel.</p>
      </header>

      <div class="sim-layout">
        <!-- Form -->
        <form class="card" @submit.prevent="handleSubmit">
          <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>

          <div class="form-group">
            <label for="name" class="form-label">Nom de la simulation</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="ex: PEA horizon 2045"
              required
            />
          </div>

          <div class="form-group">
            <label for="initial" class="form-label">Capital initial (€)</label>
            <input
              id="initial"
              v-model.number="form.initialCapital"
              type="number"
              min="0"
              step="100"
              class="form-input num"
              required
            />
          </div>

          <div class="form-group">
            <label for="monthly" class="form-label">Versement mensuel (€)</label>
            <input
              id="monthly"
              v-model.number="form.monthlyContribution"
              type="number"
              min="0"
              step="50"
              class="form-input num"
            />
            <p class="form-help">Mets 0 si tu ne veux pas de versement régulier.</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="rate" class="form-label">Taux annuel (%)</label>
              <input
                id="rate"
                v-model.number="form.annualRate"
                type="number"
                step="0.1"
                class="form-input num"
                required
              />
              <p class="form-help">Moyenne SP500 ≈ 8%, livret A ≈ 3%.</p>
            </div>
            <div class="form-group">
              <label for="duration" class="form-label">Durée (années)</label>
              <input
                id="duration"
                v-model.number="form.durationYears"
                type="number"
                min="1"
                max="50"
                class="form-input num"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-accent" style="width: 100%;" :disabled="submitting">
            <span v-if="submitting" class="loading"></span>
            {{ submitting ? 'Enregistrement…' : 'Enregistrer la simulation' }}
          </button>
        </form>

        <!-- Preview -->
        <div class="preview-panel">
          <div class="preview-header">
            <span class="eyebrow">— aperçu</span>
            <h3>Projection en temps réel</h3>
          </div>

          <div v-if="preview" class="preview-stats">
            <div>
              <span class="stat-label">Capital final</span>
              <span class="preview-big num">{{ formatEUR(preview.finalCapital) }}</span>
            </div>
            <div class="preview-breakdown">
              <div>
                <span class="stat-label">Versé</span>
                <span class="num">{{ formatEUR(preview.totalContributions) }}</span>
              </div>
              <div>
                <span class="stat-label">Intérêts</span>
                <span class="num text-accent">+{{ formatEUR(preview.totalInterest) }}</span>
              </div>
              <div>
                <span class="stat-label">Multiplicateur</span>
                <span class="num">
                  ×{{ (preview.finalCapital / (preview.totalContributions || 1)).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="preview?.breakdown" class="mt-3">
            <SimulationChart :breakdown="preview.breakdown" />
          </div>

          <div v-else-if="previewLoading" class="text-center text-muted">
            <span class="loading"></span> Calcul en cours…
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .sim-layout { grid-template-columns: 1fr; }
}

.preview-panel {
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius-lg);
  padding: 2rem;
  position: sticky;
  top: 90px;
}

.preview-header {
  border-bottom: 1px solid var(--rule);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.preview-stats {
  margin-bottom: 1.5rem;
}

.preview-big {
  display: block;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0.5rem 0 1.5rem;
  line-height: 1;
}

.preview-breakdown {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--rule);
}

.preview-breakdown > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-breakdown .num {
  font-size: 1rem;
  font-weight: 600;
}
</style>
