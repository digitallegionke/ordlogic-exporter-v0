"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast, { Toaster } from "react-hot-toast"
import { Plus, MapPin } from "lucide-react"
import { mockApi, type Farm } from "@/lib/mockData"

const CROP_TYPES = [
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

const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
  "Meru",
  "Nyeri",
  "Machakos",
  "Kericho",
]

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(false)
  const [exporterId, setExporterId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    farmName: "",
    county: "",
    cropType: "",
    acreage: "",
  })

  useEffect(() => {
    fetchExporterAndFarms()
  }, [])

  const fetchExporterAndFarms = async () => {
    try {
      const { user } = await mockApi.getUser()
      if (!user) return

      // Get exporter data
      const { data: exporterData } = await mockApi.getExporter()

      if (exporterData) {
        setExporterId(exporterData.id)

        // Fetch farms
        const { data: farmsData } = await mockApi.getFarms()
        setFarms(farmsData || [])
      }
    } catch (error: any) {
      toast.error("Failed to load farms")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exporterId) return

    setLoading(true)
    try {
      const { data, error } = await mockApi.createFarm({
        farm_name: formData.farmName,
        county: formData.county,
        crop_type: formData.cropType,
        acreage: formData.acreage ? Number.parseFloat(formData.acreage) : null,
      })

      if (error) throw error

      setFarms((prev) => [data, ...prev])
      setFormData({ farmName: "", county: "", cropType: "", acreage: "" })
      setIsDialogOpen(false)
      toast.success("Farm added successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to add farm")
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

  return (
    <DashboardLayout>
      <Toaster position="top-right" />

      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farms</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Farm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Farm</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="Enter farm name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Select
                    value={formData.county}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, county: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTIES.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select
                    value={formData.cropType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, cropType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_TYPES.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="acreage">Acreage</Label>
                  <Input
                    id="acreage"
                    name="acreage"
                    type="number"
                    step="0.1"
                    value={formData.acreage}
                    onChange={handleChange}
                    placeholder="Enter acreage (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Farm"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {farms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farms added yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Start by adding your first farm to begin managing your produce sources.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card key={farm.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    {farm.farm_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">County:</span>
                      <span className="text-sm font-medium">{farm.county}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Crop:</span>
                      <span className="text-sm font-medium">{farm.crop_type}</span>
                    </div>
                    {farm.acreage && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Acreage:</span>
                        <span className="text-sm font-medium">{farm.acreage} acres</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Added:</span>
                      <span className="text-sm font-medium">{new Date(farm.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
