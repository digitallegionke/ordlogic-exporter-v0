"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import toast, { Toaster } from "react-hot-toast"
import { Bell, Shield, Trash2, AlertTriangle, Mail, Smartphone } from "lucide-react"
import { mockApi } from "@/lib/mockData"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    smsOrders: true,
    smsMarketing: false,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    toast.success("Notification preferences updated")
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      // Simulate password change
      await mockApi.delay(1500)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password updated successfully")
    } catch (error: any) {
      toast.error("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)
    try {
      await mockApi.delay(2000)
      await mockApi.signOut()
      toast.success("Account deleted successfully")
      router.push("/exporter/signup")
    } catch (error: any) {
      toast.error("Failed to delete account")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email notifications for orders</p>
                    <p className="text-xs text-gray-500">Get notified about order updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.emailOrders}
                  onCheckedChange={(value) => handleNotificationChange("emailOrders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Marketing emails</p>
                    <p className="text-xs text-gray-500">Receive updates about new features and tips</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(value) => handleNotificationChange("emailMarketing", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">SMS notifications for orders</p>
                    <p className="text-xs text-gray-500">Get urgent order updates via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.smsOrders}
                  onCheckedChange={(value) => handleNotificationChange("smsOrders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">SMS marketing messages</p>
                    <p className="text-xs text-gray-500">Receive promotional messages via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.smsMarketing}
                  onCheckedChange={(value) => handleNotificationChange("smsMarketing", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Deleting your account will permanently remove all your data including farms, orders, and profile
                  information. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteLoading ? "Deleting Account..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
