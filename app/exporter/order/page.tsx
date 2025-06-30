"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingCart, Calendar, Package } from "lucide-react"
import { mockApi, type ProduceRequest } from "@/lib/mockData"

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

export default function OrderPage() {
  const [requests, setRequests] = useState<ProduceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [exporterId, setExporterId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    crop: "",
    quantityKg: "",
    preferredCollectionDate: "",
  })

  useEffect(() => {
    fetchExporterAndRequests()
  }, [])

  const fetchExporterAndRequests = async () => {
    try {
      const { user } = await mockApi.getUser()
      if (!user) return

      // Get exporter data
      const { data: exporterData } = await mockApi.getExporter()

      if (exporterData) {
        setExporterId(exporterData.id)

        // Fetch produce requests
        const { data: requestsData } = await mockApi.getProduceRequests()
        setRequests(requestsData || [])
      }
    } catch (error: any) {
      toast.error("Failed to load orders")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exporterId) return

    setLoading(true)
    try {
      const { data, error } = await mockApi.createProduceRequest({
        crop: formData.crop,
        quantity_kg: Number.parseFloat(formData.quantityKg),
        preferred_collection_date: formData.preferredCollectionDate || null,
      })

      if (error) throw error

      setRequests((prev) => [data, ...prev])
      setFormData({ crop: "", quantityKg: "", preferredCollectionDate: "" })
      toast.success("Produce request submitted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request")
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Produce Orders</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                New Produce Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="crop">Crop Type</Label>
                  <Select
                    value={formData.crop}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, crop: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_OPTIONS.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantityKg">Quantity (KG)</Label>
                  <Input
                    id="quantityKg"
                    name="quantityKg"
                    type="number"
                    step="0.1"
                    value={formData.quantityKg}
                    onChange={handleChange}
                    placeholder="Enter quantity in KG"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferredCollectionDate">Preferred Collection Date</Label>
                  <Input
                    id="preferredCollectionDate"
                    name="preferredCollectionDate"
                    type="date"
                    value={formData.preferredCollectionDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <Button type="submit" disabled={loading || !formData.crop || !formData.quantityKg}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Recent Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No produce requests yet</p>
                  <p className="text-sm text-gray-400">Submit your first request to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{request.crop}</h4>
                        <Badge className={getStatusColor(request.status)}>{request.status || "pending"}</Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-medium">{request.quantity_kg} KG</span>
                        </div>

                        {request.preferred_collection_date && (
                          <div className="flex justify-between">
                            <span>Collection Date:</span>
                            <span className="font-medium flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(request.preferred_collection_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span>Requested:</span>
                          <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
