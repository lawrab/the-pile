'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Download, Loader2, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react'
import { pileApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

type NotificationType = 'success' | 'error' | null

interface ImportLibraryButtonProps {
  hasPile?: boolean
}

export function ImportLibraryButton({ hasPile = false }: ImportLibraryButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null)
  const queryClient = useQueryClient()

  const handleImport = async () => {
    setIsImporting(true)
    setNotification(null)
    
    try {
      await pileApi.importSteamLibrary()
      // Invalidate and refetch pile data immediately
      await queryClient.invalidateQueries({ queryKey: ['pile'] })
      await queryClient.refetchQueries({ queryKey: ['pile'] })
      
      setNotification({
        type: 'success',
        message: 'Steam library imported successfully!'
      })
      
      // Auto-hide success notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Failed to import Steam library:', error)
      setNotification({
        type: 'error',
        message: 'Failed to import Steam library. Please try again.'
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setNotification(null)
    
    try {
      // Use the import endpoint to get fresh Steam data including ratings
      await pileApi.importSteamLibrary()
      // Also sync playtime data
      await pileApi.syncPlaytime()
      
      // Invalidate and refetch pile data immediately
      await queryClient.invalidateQueries({ queryKey: ['pile'] })
      await queryClient.refetchQueries({ queryKey: ['pile'] })
      
      setNotification({
        type: 'success',
        message: 'Steam data synced successfully!'
      })
      
      // Auto-hide success notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Failed to sync Steam data:', error)
      setNotification({
        type: 'error',
        message: 'Failed to sync Steam data. Please try again.'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const isLoading = isImporting || isSyncing

  return (
    <div className="relative">
      <div className="flex gap-2">
        {!hasPile ? (
          <Button 
            onClick={handleImport}
            disabled={isLoading}
            className={isLoading ? 'cursor-not-allowed' : ''}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'Importing Steam Library...' : 'Import Steam Library'}
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleImport}
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed' : ''}
              variant="outline"
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isImporting ? 'Re-importing...' : 'Re-import Library'}
            </Button>
            <Button 
              onClick={handleSync}
              disabled={isLoading}
              className={isLoading ? 'cursor-not-allowed' : ''}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Syncing Steam Data...' : 'Sync Steam Data'}
            </Button>
          </>
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