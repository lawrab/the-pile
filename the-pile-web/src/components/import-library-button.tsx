'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Download } from 'lucide-react'
import { pileApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export function ImportLibraryButton() {
  const [isImporting, setIsImporting] = useState(false)
  const queryClient = useQueryClient()

  const handleImport = async () => {
    setIsImporting(true)
    try {
      await pileApi.importSteamLibrary()
      // Invalidate and refetch pile data immediately
      await queryClient.invalidateQueries({ queryKey: ['pile'] })
      await queryClient.refetchQueries({ queryKey: ['pile'] })
    } catch (error) {
      console.error('Failed to import Steam library:', error)
      alert('Failed to import Steam library. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Button 
      onClick={handleImport}
      disabled={isImporting}
    >
      <Download className="mr-2 h-4 w-4" />
      {isImporting ? 'Importing...' : 'Import Steam Library'}
    </Button>
  )
}