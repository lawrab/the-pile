'use client'

import { useAuth } from '@/lib/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { AdvancedSettings } from '@/components/advanced-settings'
import { useState } from 'react'
import { authApi } from '@/lib/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await authApi.requestAccountDeletion()
      alert(`Account deletion scheduled. You have 30 days to cancel this request by logging in again.`)
      // Optionally redirect to logout or show success message
    } catch (error) {
      console.error('Failed to request account deletion:', error)
      alert('Failed to request account deletion. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar_url && (
                <Image 
                  src={user.avatar_url} 
                  alt={user.username}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-2 border-slate-700"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">{user.username}</h2>
                <p className="text-gray-400">Steam ID: {user.steam_id}</p>
                {user.shame_score !== undefined && (
                  <p className="text-sm text-gray-500">Current Shame Score: {user.shame_score.toFixed(0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pile Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAdvanced ? (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Manage your pile data and import settings. Advanced operations can permanently modify your data.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvanced(true)}
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-950/50"
                >
                  Show Advanced Settings
                </Button>
              </div>
            ) : (
              <AdvancedSettings onClose={() => setShowAdvanced(false)} />
            )}
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-500/50 bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-300">
                Permanently delete your account and all associated data from The Pile.
              </p>
              <p className="text-sm text-gray-400">
                This action cannot be undone. You will have a 30-day grace period to cancel this request.
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Your profile will be deleted</li>
                <li>• All pile entries and game data will be removed</li>
                <li>• Statistics and shame scores will be erased</li>
                <li>• You can cancel within 30 days by logging in again</li>
              </ul>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-600 text-red-400 hover:bg-red-950/50 hover:text-red-300"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Processing...' : 'Delete My Account'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        type="danger"
        title="Delete Account"
        message="Are you sure you want to delete your account? This will schedule your account for deletion in 30 days. You can cancel this request by logging in again within that time period."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
      />
    </div>
  )
}