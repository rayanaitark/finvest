import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fp from 'fastify-plugin'

import config from '../config.js'
import User from '../users/user-schema.js'

/**
 *
 * @param {import('fastify').FastifyInstance} app
 */
async function authPlugin(app) {
  await app.register(fastifyCookie)
  await app.register(fastifyJwt, {
    secret: config.jwt.secret,
    cookie: {
      cookieName: config.jwt.cookieName,
      signed: false,
    },
  })

  app.decorateRequest('currentUser', null)

  app.decorate('authenticate', async (request, reply) => {
    try {
      // On essaie d'abord le cookie (dev local / same-origin)
      // puis le header Authorization: Bearer xxx (prod cross-origin)
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ error: 'Authentification requise' })
    }

    const user = await User.findById(request.user.sub)
      .select('_id email username emailVerified createdAt updatedAt')
      .lean()

    if (!user) {
      return reply.status(401).send({ error: 'Utilisateur introuvable' })
    }

    request.currentUser = user
  })
}

export default fp(authPlugin)
