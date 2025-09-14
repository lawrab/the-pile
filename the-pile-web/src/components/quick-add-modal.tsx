'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Search, Plus, Gamepad2 } from 'lucide-react'
import { GameStatus } from '@/types'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGame: (gameName: string, status: GameStatus) => void
}

export function QuickAddModal({ isOpen, onClose, onAddGame }: QuickAddModalProps) {
  const [gameName, setGameName] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>(GameStatus.UNPLAYED)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameName.trim()) {
      onAddGame(gameName.trim(), selectedStatus)
      setGameName('')
      onClose()
    }
  }

  const statusOptions = [
    { value: GameStatus.UNPLAYED, label: 'Not Started', color: 'text-red-400' },
    { value: GameStatus.PLAYING, label: 'Currently Playing', color: 'text-yellow-400' },
    { value: GameStatus.COMPLETED, label: 'Completed', color: 'text-green-400' },
    { value: GameStatus.ABANDONED, label: 'Abandoned', color: 'text-gray-400' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Add Game
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Name Input */}
            <div>
              <label htmlFor="gameName" className="block text-sm font-medium mb-2">
                Game Name
              </label>
              <div className="relative">
                <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="gameName"
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Enter game name..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Initial Status
              </label>
              <div className="grid gap-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStatus === option.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={() => setSelectedStatus(option.value)}
                      className="sr-only"
                    />
                    <div className={`w-3 h-3 rounded-full ${
                      selectedStatus === option.value
                        ? 'bg-blue-500'
                        : 'bg-slate-600 border border-slate-500'
                    }`} />
                    <span className={option.color}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!gameName.trim()}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Game
              </Button>
            </div>
          </form>

          {/* Helper Text */}
          <div className="mt-4 p-3 bg-slate-900/30 rounded-lg">
            <p className="text-xs text-slate-400">
              💡 <strong>Tip:</strong> Use keyboard shortcut <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">N</kbd> to quickly open this dialog
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}