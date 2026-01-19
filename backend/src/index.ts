import { app } from './app'
import { config } from './config'
import { connectDatabase } from './config/database'
import { logger } from './utils/logger'

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase()

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
      logger.info(`Environment: ${config.env}`)
      logger.info(`API docs available at http://localhost:${config.port}/api/docs`)
    })
  } catch (error) {
    logger.error({ error }, 'Failed to start server')
    process.exit(1)
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception')
  process.exit(1)
})

bootstrap()
