import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node environment (Jest tests)
export const server = setupServer(...handlers)