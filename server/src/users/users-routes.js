import User from './user-schema.js'

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
function usersRoutes(app) {
  // Vérification de l'email via le token envoyé par mail
  app.get('/verify-email', async (request, reply) => {
    const { token } = request.query

    if (!token) {
      return reply.status(400).send({ error: 'Token de validation manquant' })
    }

    const user = await User.findOne({ validationToken: token })

    if (!user) {
      return reply.status(404).send({ error: 'Token invalide ou expiré' })
    }

    if (user.emailVerified) {
      return reply.status(409).send({ error: 'Email déjà vérifié' })
    }

    // On valide et on supprime le token
    user.emailVerified = true
    user.validationToken = null
    await user.save()

    return reply.send({ message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' })
  })

  // Route protégée : infos du user connecté
  app.get('/me', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    return reply.send({ user: request.user })
  })

  // Liste des utilisateurs (protégée)
  app.get('', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const page = parseInt(request.query.page) || 1
    const limit = parseInt(request.query.limit) || 20
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('_id email username emailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await User.countDocuments()

    return reply.send({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  })

  // Récupérer un user par son ID
  app.get('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    const user = await User.findById(id)
      .select('_id email username emailVerified createdAt')
      .lean()

    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.send({ user })
  })

  // Supprimer un user par ID
  app.delete('/:id', {
    onRequest: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur introuvable' })
    }

    return reply.send({ message: 'Utilisateur supprimé' })
  })
}

export default usersRoutes
