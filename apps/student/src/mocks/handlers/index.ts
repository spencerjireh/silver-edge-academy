import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { courseHandlers } from './courses'
import { shopHandlers } from './shop'
import { gamificationHandlers } from './gamification'
import { sandboxHandlers } from './sandbox'
import { helpHandlers } from './help'
import { profileHandlers } from './profile'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...courseHandlers,
  ...shopHandlers,
  ...gamificationHandlers,
  ...sandboxHandlers,
  ...helpHandlers,
  ...profileHandlers,
]
