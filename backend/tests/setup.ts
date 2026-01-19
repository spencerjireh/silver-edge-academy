import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongoServer: MongoMemoryServer | null = null

export async function setupTestDatabase() {
  // Use real MongoDB container if MONGODB_URI is set (Docker test environment)
  // Otherwise use in-memory server for local development
  const uri = process.env.MONGODB_URI

  if (uri) {
    await mongoose.connect(uri)
  } else {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  }
}

export async function teardownTestDatabase() {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}
