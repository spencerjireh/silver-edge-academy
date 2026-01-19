import mongoose from 'mongoose'
import { config } from './index'
import { logger } from '../utils/logger'

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.db.uri)
    logger.info('Connected to MongoDB')
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB')
    process.exit(1)
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect()
    logger.info('Disconnected from MongoDB')
  } catch (error) {
    logger.error({ error }, 'Failed to disconnect from MongoDB')
  }
}

mongoose.connection.on('error', (error) => {
  logger.error({ error }, 'MongoDB connection error')
})

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})
