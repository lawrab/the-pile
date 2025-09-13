import { useQuery } from '@tanstack/react-query'
import { pileApi } from './api'

export const usePile = (enabled = true) => {
  return useQuery({
    queryKey: ['pile'],
    queryFn: async () => {
      const response = await pileApi.getPile()
      return response.data
    },
    enabled,
    staleTime: 0, // Always refetch to get fresh data
  })
}