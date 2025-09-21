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
  const [isCanceling, setIsCanceling] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await authApi.requestAccountDeletion()
      alert(`Account deletion scheduled. You have 30 days to cancel this request by logging in again.`)
      // Refresh the page to show the new state
      window.location.reload()
    } catch (error) {
      console.error('Failed to request account deletion:', error)
      alert('Failed to request account deletion. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDeletion = async () => {
    setIsCanceling(true)
    try {
      const response = await authApi.cancelAccountDeletion()
      alert('Account deletion request cancelled successfully.')
      // Refresh the page to show the new state
      window.location.reload()
    } catch (error) {
      console.error('Failed to cancel account deletion:', error)
      alert('Failed to cancel account deletion. Please try again.')
    } finally {
      setIsCanceling(false)
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
              {user.deletion_requested_at ? 'Account Deletion Pending' : 'Delete Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.deletion_requested_at ? (
              /* Deletion is pending - show cancellation option */
              <div className="space-y-4">
                <div className="p-4 bg-orange-950/30 border border-orange-500/50 rounded-lg">
                  <h3 className="font-semibold text-orange-400 mb-2">⚠️ Account Deletion Scheduled</h3>
                  <p className="text-gray-300 mb-2">
                    Your account is scheduled for deletion on{' '}
                    <span className="font-mono text-orange-300">
                      {user.deletion_scheduled_at ? new Date(user.deletion_scheduled_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    You can cancel this request at any time before the deletion date.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={handleCancelDeletion}
                    className="border-green-600 text-green-400 hover:bg-green-950/50 hover:text-green-300"
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Canceling...' : 'Cancel Deletion Request'}
                  </Button>
                </div>
              </div>
            ) : (
              /* No deletion pending - show normal deletion option */
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
                
                <Button 
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="border-red-600 text-red-400 hover:bg-red-950/50 hover:text-red-300 mt-4"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Processing...' : 'Delete My Account'}
                </Button>
              </div>
            )}
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