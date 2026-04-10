import Fastify from 'fastify'
import cors from '@fastify/cors'

import config from './config.js'
import envToLogger from './logger.js'
import authPlugin from './plugins/auth.js'
import mongoosePlugin from './plugins/mongoose.js'
import rootRoutes from './rootRoute.js'
import authRoutes from './users/auth-routes.js'
import usersRoutes from './users/users-routes.js'
import simulationsRoutes from './simulations/simulations-routes.js'

async function buildApp() {
  const fastify = Fastify({
    logger: envToLogger[config.env] ?? true,
  })

  // CORS pour que le front (port 5173) puisse appeler le back (port 3000)
  await fastify.register(cors, {
    origin: config.env === 'production'
      ? config.appBaseUrl
      : true, // En dev on accepte tout
    credentials: true, // Important pour les cookies JWT
  })

  await fastify.register(authPlugin)
  await fastify.register(mongoosePlugin)
  fastify.register(authRoutes, { prefix: '/auth' })
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(simulationsRoutes, { prefix: '/simulations' })
  fastify.register(rootRoutes)

  return fastify
}

export default buildApp
