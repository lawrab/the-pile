'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AlertTriangle, Trash2, Download, Loader2 } from 'lucide-react'
import { pileApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

interface AdvancedSettingsProps {
  onClose?: () => void
}

export function AdvancedSettings({ onClose }: AdvancedSettingsProps) {
  const [isReimporting, setIsReimporting] = useState(false)
  const [confirmReimport, setConfirmReimport] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const queryClient = useQueryClient()

  const handleReimport = async () => {
    if (!confirmReimport) {
      setConfirmReimport(true)
      return
    }

    setIsReimporting(true)
    setNotification(null)

    try {
      // Step 1: Clear existing pile data (this also resets throttling)
      const clearResponse = await pileApi.clearPile()
      
      // Step 2: Import fresh data (throttling is now reset)
      const importResponse = await pileApi.importSteamLibrary()
      
      // Check if import response contains rate limit error (shouldn't happen after clear)
      if (importResponse.data?.error === 'Rate limit exceeded') {
        setNotification({
          type: 'error',
          message: 'Unexpected rate limit after clear. Please try again.'
        })
        setConfirmReimport(false)
        return
      }
      
      // Invalidate all cached data
      await queryClient.invalidateQueries({ queryKey: ['pile'] })
      await queryClient.invalidateQueries({ queryKey: ['shameScore'] })
      await queryClient.invalidateQueries({ queryKey: ['shame-score'] })
      await queryClient.invalidateQueries({ queryKey: ['reality-check'] })
      await queryClient.invalidateQueries({ queryKey: ['insights'] })
      
      setNotification({
        type: 'success',
        message: `Reimport started successfully. Cleared ${clearResponse.data?.cleared_count || 0} games and importing fresh data.`
      })
      
      setConfirmReimport(false)
      
      // Auto-hide success notification
      setTimeout(() => setNotification(null), 5000)
      
    } catch (error: any) {
      console.error('Failed to reimport library:', error)
      
      let errorMessage = 'Failed to start reimport. Please try again.'
      
      // Check for specific error types
      if (error.response?.data?.error === 'Rate limit exceeded') {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.'
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      })
      setConfirmReimport(false)
    } finally {
      setIsReimporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-800/50 bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Complete Library Reimport</h3>
            <p className="text-sm text-gray-400">
              This will permanently delete all your current pile data including game statuses, 
              playtime records, and amnesty grants, then import your Steam library fresh. 
              <strong className="text-red-400"> This action cannot be undone.</strong>
            </p>
            
            <div className="flex flex-col gap-2">
              {!confirmReimport ? (
                <Button 
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-950/50"
                  onClick={handleReimport}
                  disabled={isReimporting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reimport Library (Clear & Import)
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-400">
                    ⚠️ Are you sure? This will delete ALL your pile data!
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleReimport}
                      disabled={isReimporting}
                    >
                      {isReimporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {isReimporting ? 'Reimporting...' : 'Yes, Delete & Reimport'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setConfirmReimport(false)}
                      disabled={isReimporting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-green-950/50 border-green-800 text-green-200'
            : 'bg-red-950/50 border-red-800 text-red-200'
        }`}>
          <p className="text-sm">{notification.message}</p>
        </div>
      )}

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  )
}