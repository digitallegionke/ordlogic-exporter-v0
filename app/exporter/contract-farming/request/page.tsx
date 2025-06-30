"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

const PRODUCE_TYPES = [
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
];

export default function ContractFarmingRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    produceType: "",
    quantity: "",
    preferredLocation: "",
    latitude: "",
    longitude: "",
    organicRequired: "No",
    handlingInstructions: "",
    dropoffLocation: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      const { error } = await supabase.from("sourcing_requests").insert({
        client_id: user.id,
        produce_type: form.produceType,
        quantity: form.quantity ? Number(form.quantity) : null,
        preferred_location: form.preferredLocation,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        organic_required: form.organicRequired === "Yes",
        handling_instructions: form.handlingInstructions,
        dropoff_location: form.dropoffLocation,
      });
      if (error) throw new Error(error.message);
      toast.success("Request submitted successfully!");
      setForm({
        produceType: "",
        quantity: "",
        preferredLocation: "",
        latitude: "",
        longitude: "",
        organicRequired: "No",
        handlingInstructions: "",
        dropoffLocation: "",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Contract Farming Sourcing Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Produce Type *</Label>
                <Select value={form.produceType} onValueChange={(v) => handleChange("produceType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select produce type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity (kg) *</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="Enter quantity in kg"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <Label>Preferred Location *</Label>
                <Input
                  value={form.preferredLocation}
                  onChange={(e) => handleChange("preferredLocation", e.target.value)}
                  placeholder="Enter preferred location"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    placeholder="Latitude (optional)"
                    step="any"
                  />
                </div>
                <div className="flex-1">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    placeholder="Longitude (optional)"
                    step="any"
                  />
                </div>
              </div>
              <div>
                <Label>Organic Required *</Label>
                <Select value={form.organicRequired} onValueChange={(v) => handleChange("organicRequired", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Handling Instructions</Label>
                <Textarea
                  value={form.handlingInstructions}
                  onChange={(e) => handleChange("handlingInstructions", e.target.value)}
                  placeholder="Any special handling instructions..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Preferred Drop-off Location</Label>
                <Input
                  value={form.dropoffLocation}
                  onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                  placeholder="Enter drop-off location"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !form.produceType || !form.quantity || !form.preferredLocation}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 