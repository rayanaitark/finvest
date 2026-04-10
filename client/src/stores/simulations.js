import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.js'

export const useSimulationsStore = defineStore('simulations', () => {
  const simulations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Quelques stats calculées pour le dashboard
  const totalSimulations = computed(() => simulations.value.length)

  const totalProjectedCapital = computed(() =>
    simulations.value.reduce((sum, s) => sum + s.finalCapital, 0),
  )

  const totalInterestEarned = computed(() =>
    simulations.value.reduce((sum, s) => sum + s.totalInterest, 0),
  )

  const bestSimulation = computed(() => {
    if (simulations.value.length === 0) return null
    return simulations.value.reduce((best, s) =>
      s.totalInterest > best.totalInterest ? s : best,
    )
  })

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const data = await api.getSimulations()
      simulations.value = data.simulations
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    error.value = null
    try {
      const data = await api.createSimulation(payload)
      // On ajoute en tête de liste pour le voir tout de suite
      simulations.value.unshift(data.simulation)
      return data.simulation
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    try {
      await api.deleteSimulation(id)
      simulations.value = simulations.value.filter(s => s._id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    simulations,
    loading,
    error,
    totalSimulations,
    totalProjectedCapital,
    totalInterestEarned,
    bestSimulation,
    fetchAll,
    create,
    remove,
  }
})
