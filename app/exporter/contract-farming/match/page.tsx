"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Phone as PhoneIcon } from "lucide-react";

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

// Add mapping for county and hub UUIDs to names
const countyMap: Record<string, string> = {
  "a52572b0-838a-4a19-87c6-46dc9979f759": "Bomet",
  "55586541-4e5c-4e60-0f9c-9d7c1e8e7f2f": "Kiambu",
  "8d0c90b4-a779-48b0-bf77-7980b8e64f55": "Kisii",
  "e0f83c2a-c46e-4c5b-8fa6-c7b8862e9958": "Meru",
  "f4f75f40-3d4b-5d59-9e8b-8c6b0d7d6e1e": "Nakuru",
  "6fd6afc1-55c7-4ec8-81a8-4dc7b45c0f08": "Kakamega",
  "a4dacfb9-0927-4de4-b157-ba2d72aed1a6": "Machakos",
  "e3e64e35-2c3a-4c48-8d7a-7b5a9c6f5c0d": "Kisumu",
  "32405c25-af16-41bb-96e5-fba87f9d0737": "Turkana",
  "d6d62fb9-f5c8-4c6c-8b29-1c5e637c9805": "Mombasa",
  "03639041-69e2-4316-a9d9-b7366e1d61a9": "Uasin Gishu",
  "1666948b-808f-4dea-a9fa-d89e95a88138": "Nyeri",
  "aad5c73e-ad82-4304-b8e5-adf537314935": "Kitui",
  "33c9ece5-05a9-40ed-9621-41eeb9015551": "Narok",
  "df484d21-0329-451f-bb63-f3c67380a2d7": "Kilifi",
  "5f171fb5-7338-4119-9465-bf31b1b2bfac": "Murang'a",
  "c0bfea47-6350-4fb4-918f-5f1cb777c0ed": "Elgeyo-Marakwet"
};

const hubMap: Record<string, string> = {
  "945d0009-22ed-41c5-a893-fd6a5fcdae06": "Nairobi Primary",
  "b655d5b0-dd05-422a-a12e-dbdadc898aba": "Limuru"
};

export default function AllFarmersPage() {
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      let { data: dbFarmers, error } = await supabase
        .from("farmer_v2")
        .select("*");
      if (error || !dbFarmers || dbFarmers.length === 0) {
        console.error('Supabase error:', error);
        toast.error("Could not fetch farmers from database. Showing mock data.");
        dbFarmers = MOCK_FARMERS;
      }
      setFarmers(dbFarmers);
      setLoading(false);
    };
    fetchFarmers();
  }, []);

  // Filter farmers by search
  const filteredFarmers = farmers.filter((farmer) => {
    const q = search.toLowerCase();
    return (
      (farmer.name && farmer.name.toLowerCase().includes(q)) ||
      (farmer.phone_number && farmer.phone_number.toLowerCase().includes(q)) ||
      (farmer.county && farmer.county.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Registered Farmers</h2>
        <Input
          className="mb-4 max-w-md"
          placeholder="Search farmers by name, phone, county"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NAME</TableHead>
                    <TableHead>PHONE</TableHead>
                    <TableHead>COUNTY</TableHead>
                    <TableHead>CROPS</TableHead>
                    <TableHead>ACREAGE</TableHead>
                    <TableHead>DROP-OFF HUB</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredFarmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">No farmers found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell>
                          <div className="font-semibold">{farmer.name || <span className="text-gray-400">No name</span>}</div>
                          <div className="text-xs text-muted-foreground">ID: {farmer.id}</div>
                        </TableCell>
                        <TableCell>
                          {farmer.phone_number ? (
                            <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4 text-gray-400" /> {farmer.phone_number}</span>
                          ) : <span className="text-gray-400 text-xs">No phone</span>}
                        </TableCell>
                        <TableCell>
                          {countyMap[farmer.county] || farmer.county || <span className="text-gray-400 text-xs">-</span>}
                        </TableCell>
                        <TableCell>
                          {farmer.crop ? (
                            <div className="flex flex-wrap gap-1">
                              {farmer.crop.split(',').map((crop: string) => (
                                <Badge key={crop.trim()} variant="outline" className="bg-green-100 text-green-700 border-green-200">{crop.trim()}</Badge>
                              ))}
                            </div>
                          ) : <Badge variant="outline" className="bg-gray-100 text-gray-400 border-gray-200">No crops</Badge>}
                        </TableCell>
                        <TableCell>{farmer.acreage ? `${farmer.acreage} acres` : <span className="text-gray-400 text-xs">-</span>}</TableCell>
                        <TableCell>
                          {hubMap[farmer.hub_id] || farmer.hub_id || <span className="text-gray-400 text-xs">-</span>}
                        </TableCell>
                        <TableCell>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Edit"><Pencil className="w-4 h-4 text-gray-400" /></button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 