import React from 'react'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePile, useGameStatusMutations } from '@/lib/hooks'

// Mock the API module
jest.mock('@/lib/api', () => ({
  pileApi: {
    getPile: jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          status: 'unplayed',
          steam_game: { name: 'Portal' }
        },
        {
          id: '2', 
          status: 'playing',
          steam_game: { name: 'Portal 2' }
        }
      ]
    }),
    grantAmnesty: jest.fn().mockResolvedValue({}),
    startPlaying: jest.fn().mockResolvedValue({}),
    markCompleted: jest.fn().mockResolvedValue({}),
    markAbandoned: jest.fn().mockResolvedValue({}),
    updateStatus: jest.fn().mockResolvedValue({})
  }
}))

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )
  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

describe('usePile hook', () => {
  it('returns hook functions', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => usePile(), { wrapper })

    // Should have the expected hook properties
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
  })

})

describe('useGameStatusMutations hook', () => {
  it('provides mutation functions', () => {
    const wrapper = createWrapper()

    const { result } = renderHook(() => useGameStatusMutations(), { wrapper })

    expect(typeof result.current.grantAmnesty.mutate).toBe('function')
    expect(typeof result.current.startPlaying.mutate).toBe('function')
    expect(typeof result.current.markCompleted.mutate).toBe('function')
    expect(typeof result.current.markAbandoned.mutate).toBe('function')
    expect(typeof result.current.updateStatus.mutate).toBe('function')
  })
})