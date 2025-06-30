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
import { supabase } from "@/lib/supabaseClient"

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

const COUNTRY_OPTIONS = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Nigeria",
  "Ghana",
  "South Africa",
  "Other"
];

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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error("User fetch error:", userError)
        return
      }

      console.log('Fetching profile for user:', user.id)

      // Get exporter data only
      const { data: exporterData, error: exporterError } = await supabase
        .from('exporters')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      console.log('Supabase query result:', { exporterData, exporterError })

      if (exporterError && exporterError.code === 'PGRST116') {
        // No exporter found, create a basic one
        console.log('No exporter found, creating one...')
        const { data: newExporter, error: createError } = await supabase
          .from('exporters')
          .insert({
            auth_user_id: user.id,
            company_name: user.email?.split('@')[0] || 'Your Company',
            contact_person: user.email?.split('@')[0] || 'Contact Person',
            email: user.email || '',
            phone: null,
            country: '',
            product_focus: []
          })
          .select('*')
          .single()

        if (createError) {
          console.error('Failed to create exporter:', createError)
          toast.error(`Failed to create profile: ${createError.message}`)
          return
        }

        if (!newExporter) {
          console.error('Exporter creation returned no data')
          toast.error("Failed to create profile: No data returned")
          return
        }

        console.log('Created new exporter:', newExporter)
        
        if (!newExporter.id) {
          console.error('Created exporter has no ID:', newExporter)
          toast.error("Failed to create profile: Invalid ID")
          return
        }
        
        setExporterId(newExporter.id)
        setFormData({
          companyName: newExporter.company_name || "",
          contactPerson: newExporter.contact_person || "",
          email: newExporter.email || "",
          phone: newExporter.phone || "",
          country: newExporter.country || "",
          productFocus: newExporter.product_focus || [],
        })
        return
      } else if (exporterError) {
        console.error('Exporter fetch error:', exporterError)
        toast.error("Failed to load profile")
        return
      }

      if (!exporterData) {
        console.error('No exporter data returned')
        toast.error("No profile data found")
        return
      }

      console.log('Loaded exporter data:', exporterData)
      
      if (!exporterData.id) {
        console.error('Existing exporter has no ID:', exporterData)
        toast.error("Profile data is invalid")
        return
      }
      
      setExporterId(exporterData.id)
      setFormData({
        companyName: exporterData.company_name || "",
        contactPerson: exporterData.contact_person || "",
        email: exporterData.email || "",
        phone: exporterData.phone || "",
        country: exporterData.country || "",
        productFocus: exporterData.product_focus || [],
      })
    } catch (error: any) {
      console.error("Unhandled fetchProfile error:", error)
      toast.error("Failed to load profile")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exporterId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('exporters')
        .update({
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          product_focus: formData.productFocus,
        })
        .eq('id', exporterId)

      if (error) throw error

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
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

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
                <Button type="button" variant="outline" onClick={fetchProfile}>
                  Refresh Profile
                </Button>
              </div>
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
