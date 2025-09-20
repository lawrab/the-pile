import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pileApi } from './api'

// Simple toast fallback until sonner is installed
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
}

export const usePile = (enabled = true, params?: {
  status?: string
  genre?: string
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['pile', params],
    queryFn: async () => {
      const response = await pileApi.getPile(params)
      return response.data
    },
    enabled,
    staleTime: 0, // Always refetch to get fresh data
  })
}

export const useGameStatusMutations = () => {
  const queryClient = useQueryClient()
  
  const invalidatePile = () => {
    queryClient.invalidateQueries({ queryKey: ['pile'] })
  }

  const grantAmnesty = useMutation({
    mutationFn: ({ gameId, reason }: { gameId: string | number; reason: string }) =>
      pileApi.grantAmnesty(gameId, reason),
    onSuccess: () => {
      invalidatePile()
      toast.success('Game amnesty granted.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to grant amnesty')
    },
  })

  const startPlaying = useMutation({
    mutationFn: (gameId: string | number) => pileApi.startPlaying(gameId),
    onSuccess: () => {
      invalidatePile()
      toast.success('Game marked as playing.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start playing')
    },
  })

  const markCompleted = useMutation({
    mutationFn: (gameId: string | number) => pileApi.markCompleted(gameId),
    onSuccess: () => {
      invalidatePile()
      toast.success('Game marked as completed.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to mark as completed')
    },
  })

  const markAbandoned = useMutation({
    mutationFn: ({ gameId, reason }: { gameId: string | number; reason?: string }) =>
      pileApi.markAbandoned(gameId, reason),
    onSuccess: () => {
      invalidatePile()
      toast.success('Game marked as abandoned.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to mark as abandoned')
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ gameId, status }: { 
      gameId: string | number; 
      status: 'unplayed' | 'playing' | 'completed' | 'abandoned' | 'amnesty_granted' 
    }) => pileApi.updateStatus(gameId, status),
    onSuccess: () => {
      invalidatePile()
      toast.success('Game status updated!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update status')
    },
  })

  return {
    grantAmnesty,
    startPlaying,
    markCompleted,
    markAbandoned,
    updateStatus,
  }
}