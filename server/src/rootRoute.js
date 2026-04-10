/**
 * @param {import("fastify").FastifyInstance} fastify
 */
async function rootRoutes(fastify) {
  fastify.get('/', async (_request, _reply) => {
    return {
      name: 'FinVest API',
      status: 'ok',
      version: '1.0.0',
    }
  })

  // Healthcheck pour Render
  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
}

export default rootRoutes
