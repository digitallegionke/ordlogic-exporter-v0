"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";

// Mock farmer data fallback
const MOCK_FARMERS = [
  {
    id: 1,
    name: "Jane Farmer",
    produce_types: ["Mango", "Avocado"],
    quantity_available: 1000,
    location: "Kiambu",
    organic: true,
  },
  {
    id: 2,
    name: "Green Fields Co-op",
    produce_types: ["Banana", "Tea"],
    quantity_available: 500,
    location: "Muranga",
    organic: false,
  },
  {
    id: 3,
    name: "Organic Valley",
    produce_types: ["Mango", "Passion Fruit"],
    quantity_available: 200,
    location: "Embu",
    organic: true,
  },
];

// Haversine formula for distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MatchFarmersPage({ params }: { params: { requestId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    const fetchRequestAndFarmers = async () => {
      setLoading(true);
      // Fetch sourcing request
      const { data: req, error: reqError } = await supabase
        .from("sourcing_requests")
        .select("*")
        .eq("id", params.requestId)
        .single();
      if (reqError || !req) {
        toast.error("Could not find sourcing request");
        setLoading(false);
        return;
      }
      setRequest(req);
      // Try to fetch farmers from DB
      let { data: dbFarmers, error: farmersError } = await supabase
        .from("farmers")
        .select("*");
      if (farmersError || !dbFarmers || dbFarmers.length === 0) {
        dbFarmers = MOCK_FARMERS;
      }
      // Filter logic
      let matches = dbFarmers.filter((farmer: any) => {
        const hasProduce = Array.isArray(farmer.produce_types) && farmer.produce_types.includes(req.produce_type);
        const enoughQty = Number(farmer.quantity_available) >= Number(req.quantity);
        const organicOk = !req.organic_required || !!farmer.organic;
        // Location logic: use Haversine if both have lat/lng, else fallback to text
        let locationOk = true;
        let distance = null;
        if (
          req.latitude && req.longitude &&
          farmer.latitude && farmer.longitude
        ) {
          distance = haversine(
            Number(req.latitude),
            Number(req.longitude),
            Number(farmer.latitude),
            Number(farmer.longitude)
          );
          // Only include farmers within 50km (adjust as needed)
          locationOk = distance <= 50;
        } else if (req.preferred_location) {
          locationOk = farmer.location && farmer.location.toLowerCase().includes(req.preferred_location.toLowerCase());
        }
        // Attach distance for sorting/display
        farmer._distance = distance;
        return hasProduce && enoughQty && organicOk && locationOk;
      });
      // Sort by distance if available
      matches = matches.sort((a, b) => {
        if (a._distance == null) return 1;
        if (b._distance == null) return -1;
        return a._distance - b._distance;
      });
      setFarmers(matches);
      setLoading(false);
    };
    fetchRequestAndFarmers();
    // eslint-disable-next-line
  }, [params.requestId]);

  const handleSelect = (farmer: any) => {
    // Go to contract generator with request and farmer info
    router.push(`/contract-farming/contract?requestId=${request.id}&farmerId=${farmer.id}`);
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Matching Farmers</CardTitle>
            {request && (
              <div className="text-sm text-muted-foreground mt-2">
                <b>Requested:</b> {request.produce_type} ({request.quantity}kg) in {request.preferred_location} {request.organic_required ? "(Organic)" : ""}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : farmers.length === 0 ? (
              <div className="text-red-500">No matching farmers found.</div>
            ) : (
              <div className="space-y-4">
                {farmers.map((farmer) => (
                  <div key={farmer.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50">
                    <div>
                      <div className="font-semibold text-lg">{farmer.name}</div>
                      <div className="text-sm text-muted-foreground">{farmer.location} {farmer.organic && <span className="ml-2 text-green-600">Organic</span>}</div>
                      <div className="text-sm mt-1">Available: {farmer.quantity_available}kg</div>
                      <div className="text-xs mt-1">Produce: {Array.isArray(farmer.produce_types) ? farmer.produce_types.join(", ") : farmer.produce_types}</div>
                      {typeof farmer._distance === 'number' && (
                        <div className="text-xs text-blue-600 mt-1">Distance: {farmer._distance.toFixed(1)} km</div>
                      )}
                    </div>
                    <Button className="mt-4 md:mt-0" onClick={() => handleSelect(farmer)}>
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 