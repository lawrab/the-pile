'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { IconButton } from './ui/icon-button'
import { Download, Loader2, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react'
import { pileApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { ImportStatus } from '@/types'
import { LOADING_MESSAGES, getRandomItem } from '@/lib/humor-constants'

type NotificationType = 'success' | 'error' | null

interface ImportLibraryButtonProps {
  hasPile?: boolean
}

export function ImportLibraryButton({ hasPile = false }: ImportLibraryButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null)
  const [importProgress, setImportProgress] = useState<ImportStatus | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')
  const queryClient = useQueryClient()
  
  // Poll for import status when an operation is running
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    
    if (isImporting || isSyncing) {
      pollInterval = setInterval(async () => {
        try {
          const response = await pileApi.getImportStatus()
          const status = response.data as ImportStatus
          setImportProgress(status)
          
          if (status.status === 'completed') {
            // Import completed successfully
            setNotification({
              type: 'success',
              message: `${status.operation_type === 'import' ? 'Steam library imported' : 'Steam data synced'} successfully!`
            })
            
            // Refresh all data since sync/import affects stats too
            await queryClient.invalidateQueries({ queryKey: ['pile'] })
            await queryClient.invalidateQueries({ queryKey: ['shameScore'] })
            await queryClient.invalidateQueries({ queryKey: ['shame-score'] })
            await queryClient.invalidateQueries({ queryKey: ['reality-check'] })
            await queryClient.invalidateQueries({ queryKey: ['insights'] })
            await queryClient.refetchQueries({ queryKey: ['pile'] })
            
            setIsImporting(false)
            setIsSyncing(false)
            setImportProgress(null)
            
            // Auto-hide success notification after 3 seconds
            setTimeout(() => setNotification(null), 3000)
          } else if (status.status === 'failed') {
            // Import failed
            setNotification({
              type: 'error',
              message: status.error_message || 'Import failed. Please try again.'
            })
            
            setIsImporting(false)
            setIsSyncing(false)
            setImportProgress(null)
          }
        } catch (error) {
          console.error('Failed to check import status:', error)
          // Continue polling on error - might be temporary
        }
      }, 2000) // Poll every 2 seconds
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isImporting, isSyncing, queryClient])

  const handleImport = async () => {
    setIsImporting(true)
    setLoadingMessage(getRandomItem(LOADING_MESSAGES))
    setNotification(null)
    setImportProgress(null)
    
    try {
      const response = await pileApi.importSteamLibrary()
      
      // Check if response contains rate limit error
      if (response.data?.error === 'Rate limit exceeded') {
        setNotification({
          type: 'error',
          message: response.data.message || 'Rate limit exceeded. Please try again later.'
        })
        setIsImporting(false)
        return
      }
      
      // Don't set isImporting to false here - polling will handle it
    } catch (error: any) {
      console.error('Failed to start Steam library import:', error)
      
      // Check if error response contains rate limit info
      if (error.response?.data?.error === 'Rate limit exceeded') {
        setNotification({
          type: 'error',
          message: error.response.data.message || 'Rate limit exceeded. Please try again later.'
        })
      } else {
        setNotification({
          type: 'error',
          message: error.response?.data?.detail || 'Failed to start import. Please try again.'
        })
      }
      setIsImporting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setNotification(null)
    setImportProgress(null)
    
    try {
      // Use the import endpoint to get fresh Steam data including ratings
      await pileApi.importSteamLibrary()
      // Also sync playtime data
      await pileApi.syncPlaytime()
      // Don't set isSyncing to false here - polling will handle it
    } catch (error) {
      console.error('Failed to start Steam data sync:', error)
      setNotification({
        type: 'error',
        message: 'Failed to start sync. Please try again.'
      })
      setIsSyncing(false)
    }
  }

  const isLoading = isImporting || isSyncing

  return (
    <div className="relative">
      <div className="flex gap-2">
          <IconButton 
            onClick={handleImport}
            disabled={isLoading}
            className={isLoading ? 'cursor-not-allowed' : ''}
            variant={hasPile ? "outline" : "default"}
            icon={isImporting ? Loader2 : Download}
            iconSize="md"
          >
            {isImporting 
              ? `${loadingMessage || 'Importing...'} ${importProgress ? `(${importProgress.progress_current}/${importProgress.progress_total})` : ''}`
              : (hasPile ? 'Import More Games' : 'Import Steam Library')}
          </IconButton>
          
          {hasPile && (
            <IconButton 
              onClick={handleSync}
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed' : ''}
              icon={isSyncing ? Loader2 : RefreshCw}
              iconSize="md"
            >
              {isSyncing 
                ? `Syncing... ${importProgress ? `(${importProgress.progress_current}/${importProgress.progress_total})` : ''}`
                : 'Sync Steam Data'}
            </IconButton>
          )}
      </div>
      
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`border rounded-lg shadow-lg p-4 max-w-md ${
            notification.type === 'success' 
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100'
              : 'bg-red-900/90 border-red-700 text-red-100'
          }`}>
            <div className="flex items-start gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-current/60 hover:text-current transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}