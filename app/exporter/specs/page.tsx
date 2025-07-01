"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import SpecForm from "@/components/SpecForm";
import { useEffect, useState } from "react";
import { getProduceSpecs, saveProduceSpec } from "@/api/specService";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface ProduceSpec {
  id: string;
  title: string;
  produce_type: string;
  variety: string;
  created_at: string;
  [key: string]: any;
}

export default function ClientSpecsPage() {
  const [specs, setSpecs] = useState<ProduceSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSpec, setEditSpec] = useState<ProduceSpec | null>(null);

  useEffect(() => {
    async function fetchSpecs() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await getProduceSpecs(user.id);
        setSpecs(data);
      }
      setLoading(false);
    }
    fetchSpecs();
  }, [editSpec]);

  const handleCreate = () => {
    setEditSpec(null);
  };

  const handleEdit = (spec: ProduceSpec) => {
    setEditSpec(spec);
  };

  const handleFormSubmit = () => {
    setEditSpec(null); // Reset form after submit
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Produce Specification Sheets</h1>
          <Button onClick={handleCreate}>Create Spec Sheet</Button>
        </div>
        {/* SpecForm always visible above the table */}
        <div className="mb-8 bg-white rounded-xl shadow p-6">
          <SpecForm
            onSubmit={handleFormSubmit}
            initialData={editSpec ? editSpec : null}
            mode={editSpec ? "edit" : "create"}
            onClose={handleFormSubmit}
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-0 overflow-x-auto">
            <table className="min-w-full text-sm rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-muted/80">
                  <th className="py-3 px-4 text-left font-semibold text-primary">Title</th>
                  <th className="py-3 px-4 text-left font-semibold text-primary">Produce Type</th>
                  <th className="py-3 px-4 text-left font-semibold text-primary">Variety</th>
                  <th className="py-3 px-4 text-left font-semibold text-primary">Created</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    <span className="inline-block bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, idx) => (
                  <tr key={spec.id} className={`border-b last:border-0 ${idx % 2 === 0 ? 'bg-muted/50' : 'bg-white'} hover:bg-primary/5 transition`}>
                    <td className="py-3 px-4 font-semibold whitespace-nowrap">{spec.title}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{spec.produce_type}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{spec.variety}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{new Date(spec.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 flex gap-2 items-center">
                      <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={() => handleEdit(spec)}>Edit</Button>
                      {/* Add View and Delete actions here if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {specs.length === 0 && <div className="text-center text-gray-400 py-8">No specs created yet.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 