import Simulation from './simulation-schema.js'

/**
 * Calcule les intérêts composés avec versements mensuels
 * Formule classique : on compose mois par mois
 */
function computeSimulation({ initialCapital, monthlyContribution, annualRate, durationYears }) {
  const monthlyRate = annualRate / 100 / 12
  const totalMonths = durationYears * 12

  let balance = initialCapital
  // On fait le calcul mois par mois, c'est plus clair que la formule fermée
  // et ça nous permettrait facilement de générer le détail mois par mois
  for (let m = 0; m < totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
  }

  const totalContributions = initialCapital + (monthlyContribution * totalMonths)
  const totalInterest = balance - totalContributions

  return {
    finalCapital: Math.round(balance * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  }
}

/**
 * Génère le détail année par année pour le graphe côté front
 */
function computeYearlyBreakdown({ initialCapital, monthlyContribution, annualRate, durationYears }) {
  const monthlyRate = annualRate / 100 / 12
  const breakdown = []

  let balance = initialCapital

  // Année 0 = point de départ
  breakdown.push({
    year: 0,
    balance: Math.round(balance * 100) / 100,
    totalContributed: initialCapital,
    totalInterest: 0,
  })

  let totalContributed = initialCapital

  for (let year = 1; year <= durationYears; year++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution
      totalContributed += monthlyContribution
    }
    breakdown.push({
      year,
      balance: Math.round(balance * 100) / 100,
      totalContributed: Math.round(totalContributed * 100) / 100,
      totalInterest: Math.round((balance - totalContributed) * 100) / 100,
    })
  }

  return breakdown
}

/**
 * @param {import('fastify').FastifyInstance} app
 */
function simulationsRoutes(app) {
  // Toutes les routes sont protégées
  app.addHook('onRequest', app.authenticate)

  // POST /simulations - Créer une nouvelle simulation
  app.post('', async (request, reply) => {
    const { name, initialCapital, monthlyContribution, annualRate, durationYears } = request.body

    // Validations
    if (!name || initialCapital == null || annualRate == null || !durationYears) {
      return reply.status(400).send({ error: 'Champs requis : name, initialCapital, annualRate, durationYears' })
    }

    if (initialCapital < 0 || annualRate < -50 || annualRate > 100 || durationYears < 1 || durationYears > 50) {
      return reply.status(400).send({ error: 'Valeurs hors limites' })
    }

    // Calcul des résultats
    const results = computeSimulation({
      initialCapital,
      monthlyContribution: monthlyContribution || 0,
      annualRate,
      durationYears,
    })

    const simulation = await Simulation.create({
      userId: request.user.sub,
      name: name.trim(),
      initialCapital,
      monthlyContribution: monthlyContribution || 0,
      annualRate,
      durationYears,
      ...results,
    })

    return reply.status(201).send({ simulation })
  })

  // GET /simulations - Liste des simulations de l'utilisateur connecté
  app.get('', async (request, reply) => {
    const simulations = await Simulation.find({ userId: request.user.sub })
      .sort({ createdAt: -1 })
      .lean()

    return reply.send({ simulations })
  })

  // GET /simulations/:id - Détail d'une simulation avec breakdown
  app.get('/:id', async (request, reply) => {
    const { id } = request.params

    const simulation = await Simulation.findOne({
      _id: id,
      userId: request.user.sub,
    }).lean()

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation introuvable' })
    }

    // On calcule le breakdown à la volée (pas besoin de le stocker)
    const breakdown = computeYearlyBreakdown({
      initialCapital: simulation.initialCapital,
      monthlyContribution: simulation.monthlyContribution,
      annualRate: simulation.annualRate,
      durationYears: simulation.durationYears,
    })

    return reply.send({ simulation, breakdown })
  })

  // DELETE /simulations/:id - Supprimer une simulation
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params

    const simulation = await Simulation.findOneAndDelete({
      _id: id,
      userId: request.user.sub,
    })

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation introuvable' })
    }

    return reply.send({ message: 'Simulation supprimée' })
  })

  // POST /simulations/preview - Preview sans sauvegarder (pour le form)
  app.post('/preview', async (request, reply) => {
    const { initialCapital, monthlyContribution, annualRate, durationYears } = request.body

    if (initialCapital == null || annualRate == null || !durationYears) {
      return reply.status(400).send({ error: 'Champs requis : initialCapital, annualRate, durationYears' })
    }

    const results = computeSimulation({
      initialCapital,
      monthlyContribution: monthlyContribution || 0,
      annualRate,
      durationYears,
    })

    const breakdown = computeYearlyBreakdown({
      initialCapital,
      monthlyContribution: monthlyContribution || 0,
      annualRate,
      durationYears,
    })

    return reply.send({ ...results, breakdown })
  })
}

export default simulationsRoutes
