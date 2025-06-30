"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast, { Toaster } from "react-hot-toast"
import { X } from "lucide-react"
import { mockApi } from "@/lib/mockData"

// Add these imports at the top
import { AlertCircle, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CROP_OPTIONS = [
  "Avocado",
  "Mango",
  "Banana",
  "Pineapple",
  "Coffee",
  "Tea",
  "Macadamia",
  "French Beans",
  "Snow Peas",
  "Passion Fruit",
]

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [exporterId, setExporterId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "",
    productFocus: [] as string[],
  })
  const [newCrop, setNewCrop] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { user } = await mockApi.getUser()
      if (!user) return

      // Get exporter data
      const { data: exporterData } = await mockApi.getExporter()

      if (exporterData) {
        setExporterId(exporterData.id)

        // Get profile data
        const { data: profileData } = await mockApi.getProfile()

        if (profileData) {
          setFormData({
            companyName: profileData.company_name || exporterData.company_name,
            contactPerson: profileData.contact_person || exporterData.contact_person,
            email: profileData.email || exporterData.email,
            phone: profileData.phone || exporterData.phone || "",
            country: profileData.country || "",
            productFocus: profileData.product_focus || [],
          })
        } else {
          // Initialize with exporter data
          setFormData((prev) => ({
            ...prev,
            companyName: exporterData.company_name,
            contactPerson: exporterData.contact_person,
            email: exporterData.email,
            phone: exporterData.phone || "",
          }))
        }
      }
    } catch (error: any) {
      toast.error("Failed to load profile")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exporterId) return

    setLoading(true)
    try {
      const { error } = await mockApi.upsertProfile({
        exporter_id: exporterId,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        product_focus: formData.productFocus,
      })

      if (error) throw error

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addCrop = (crop: string) => {
    if (!formData.productFocus.includes(crop)) {
      setFormData((prev) => ({
        ...prev,
        productFocus: [...prev.productFocus, crop],
      }))
    }
    setNewCrop("")
  }

  const removeCrop = (crop: string) => {
    setFormData((prev) => ({
      ...prev,
      productFocus: prev.productFocus.filter((c) => c !== crop),
    }))
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., Kenya, Uganda, Tanzania"
                  />
                </div>
              </div>

              <div>
                <Label>Product Focus</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.productFocus.map((crop) => (
                      <Badge key={crop} variant="secondary" className="flex items-center gap-1">
                        {crop}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeCrop(crop)} />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CROP_OPTIONS.filter((crop) => !formData.productFocus.includes(crop)).map((crop) => (
                      <Button key={crop} type="button" variant="outline" size="sm" onClick={() => addCrop(crop)}>
                        + {crop}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-500">{formData.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Country</p>
                      <p className="text-sm text-gray-500">{formData.country || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-500">January 2024</p>
                    </div>
                  </div>
                </div>

                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your profile information is used to connect you with relevant farms and manage your produce orders.
                    Keep it updated for the best experience.
                  </AlertDescription>
                </Alert>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
