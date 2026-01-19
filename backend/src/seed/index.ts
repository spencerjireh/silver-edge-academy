import mongoose from 'mongoose'
import { config } from '../config'
import { logger } from '../utils/logger'
import { seedUsers } from './users.seed'
import { seedCourses } from './courses.seed'
import { seedClasses } from './classes.seed'
import { seedProgress } from './progress.seed'
import { seedShop } from './shop.seed'

async function seed() {
  try {
    logger.info('Connecting to MongoDB...')
    await mongoose.connect(config.db.uri)
    logger.info('Connected to MongoDB')

    // Check if database already has data
    const userCount = await mongoose.connection.db?.collection('users').countDocuments()
    if (userCount && userCount > 0) {
      logger.warn('Database already contains data. Skipping seed.')
      logger.info('To reseed, drop the database first: make db-shell then db.dropDatabase()')
      await mongoose.disconnect()
      process.exit(0)
    }

    logger.info('Starting seed process...')

    // Seed in order due to dependencies
    const users = await seedUsers()
    const courses = await seedCourses(users.admin)
    await seedClasses(users, courses)
    await seedProgress(users, courses)
    await seedShop(users.admin)

    logger.info('='.repeat(50))
    logger.info('Seed completed successfully!')
    logger.info('='.repeat(50))
    logger.info('')
    logger.info('Default credentials:')
    logger.info('  Admin:    admin@silveredge.com / password123')
    logger.info('  Teacher1: teacher1@silveredge.com / password123')
    logger.info('  Teacher2: teacher2@silveredge.com / password123')
    logger.info('  Students: <username> / password123')
    logger.info('            (e.g., alex_coder, emma_dev, ...)')
    logger.info('  Parent:   parent@example.com / password123')
    logger.info('')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    logger.error({ error }, 'Seed failed')
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run if executed directly
seed()
