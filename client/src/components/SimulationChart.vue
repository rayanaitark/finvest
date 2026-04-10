<script setup>
import { computed } from 'vue'
import { formatEUR } from '../composables/useFormat.js'

const props = defineProps({
  breakdown: {
    type: Array,
    required: true,
  },
})

// Dimensions du SVG (viewBox, pas de pixels fixes)
const W = 800
const H = 340
const PAD = { top: 20, right: 20, bottom: 40, left: 70 }

const chart = computed(() => {
  if (!props.breakdown || props.breakdown.length === 0) return null

  const data = props.breakdown
  const maxVal = Math.max(...data.map(d => d.balance))
  const minVal = 0
  const maxYear = data[data.length - 1].year

  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xScale = year => PAD.left + (year / maxYear) * chartW
  const yScale = val => PAD.top + chartH - (val / maxVal) * chartH

  // Ligne principale (capital total)
  const balancePoints = data.map(d => `${xScale(d.year)},${yScale(d.balance)}`).join(' ')

  // Ligne des contributions (combien j'ai mis réellement)
  const contribPoints = data.map(d => `${xScale(d.year)},${yScale(d.totalContributed)}`).join(' ')

  // Aire entre les deux : c'est les intérêts
  const areaPoints = [
    ...data.map(d => `${xScale(d.year)},${yScale(d.balance)}`),
    ...data.slice().reverse().map(d => `${xScale(d.year)},${yScale(d.totalContributed)}`),
  ].join(' ')

  // Ticks sur l'axe Y (5 ticks)
  const yTicks = []
  for (let i = 0; i <= 4; i++) {
    const val = (maxVal / 4) * i
    yTicks.push({
      y: yScale(val),
      label: formatEUR(val),
    })
  }

  // Ticks sur l'axe X (on essaye de pas surcharger)
  const step = Math.max(1, Math.ceil(maxYear / 8))
  const xTicks = []
  for (let year = 0; year <= maxYear; year += step) {
    xTicks.push({
      x: xScale(year),
      label: `An ${year}`,
    })
  }
  // On s'assure que le dernier est affiché
  if (xTicks[xTicks.length - 1].label !== `An ${maxYear}`) {
    xTicks.push({ x: xScale(maxYear), label: `An ${maxYear}` })
  }

  return {
    balancePoints,
    contribPoints,
    areaPoints,
    yTicks,
    xTicks,
  }
})
</script>

<template>
  <div class="chart-wrapper">
    <svg v-if="chart" :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="xMidYMid meet">
      <!-- Grid lines horizontales -->
      <g class="chart-grid">
        <line
          v-for="tick in chart.yTicks"
          :key="`h-${tick.y}`"
          :x1="PAD.left"
          :x2="W - PAD.right"
          :y1="tick.y"
          :y2="tick.y"
        />
      </g>

      <!-- Aire des intérêts (entre les deux courbes) -->
      <polygon :points="chart.areaPoints" class="chart-area" />

      <!-- Courbe des contributions (ce que j'ai versé) -->
      <polyline :points="chart.contribPoints" class="chart-line-contrib" />

      <!-- Courbe du capital total -->
      <polyline :points="chart.balancePoints" class="chart-line-balance" />

      <!-- Labels axe Y -->
      <g class="chart-axis">
        <text
          v-for="tick in chart.yTicks"
          :key="`yl-${tick.y}`"
          :x="PAD.left - 10"
          :y="tick.y + 4"
          text-anchor="end"
        >
          {{ tick.label }}
        </text>
      </g>

      <!-- Labels axe X -->
      <g class="chart-axis">
        <text
          v-for="tick in chart.xTicks"
          :key="`xl-${tick.x}`"
          :x="tick.x"
          :y="H - PAD.bottom + 20"
          text-anchor="middle"
        >
          {{ tick.label }}
        </text>
      </g>
    </svg>

    <div class="chart-legend">
      <div class="legend-item">
        <span class="swatch swatch-balance"></span>
        <span>Capital total</span>
      </div>
      <div class="legend-item">
        <span class="swatch swatch-contrib"></span>
        <span>Versements cumulés</span>
      </div>
      <div class="legend-item">
        <span class="swatch swatch-interest"></span>
        <span>Intérêts générés</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.chart-grid line {
  stroke: var(--rule);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.chart-area {
  fill: var(--accent-soft);
  opacity: 0.7;
}

.chart-line-balance {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.chart-line-contrib {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
  stroke-linejoin: round;
}

.chart-axis text {
  font-family: var(--font-mono);
  font-size: 10px;
  fill: var(--ink-muted);
}

.chart-legend {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.swatch {
  width: 18px;
  height: 10px;
  display: inline-block;
  border-radius: 2px;
}

.swatch-balance { background: var(--accent); }
.swatch-contrib {
  background: transparent;
  border: 1px dashed var(--ink);
  height: 8px;
}
.swatch-interest { background: var(--accent-soft); }
</style>
