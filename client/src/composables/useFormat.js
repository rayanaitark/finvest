// Petits helpers de formatage, utilisés un peu partout dans l'app

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const eurFormatterPrecise = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

const pctFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatEUR(value, precise = false) {
  if (value == null || Number.isNaN(value)) return '—'
  return precise ? eurFormatterPrecise.format(value) : eurFormatter.format(value)
}

export function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return pctFormatter.format(value / 100)
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
