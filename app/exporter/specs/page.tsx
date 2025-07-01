"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import SpecForm from "@/components/SpecForm";
import { useEffect, useState } from "react";
import { getProduceSpecs, saveProduceSpec } from "@/api/specService";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ClientSpecsPage() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSpec, setEditSpec] = useState(null);

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
  }, [modalOpen]);

  const handleCreate = () => {
    setEditSpec(null);
    setModalOpen(true);
  };

  const handleEdit = (spec) => {
    setEditSpec(spec);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditSpec(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Produce Specification Sheets</h1>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>Create Spec Sheet</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full p-0 bg-transparent shadow-none border-none">
              <SpecForm
                onSubmit={handleClose}
                initialData={editSpec}
                mode={editSpec ? "edit" : "create"}
                onClose={handleClose}
              />
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left">Title</th>
                  <th className="py-2 px-3 text-left">Produce Type</th>
                  <th className="py-2 px-3 text-left">Variety</th>
                  <th className="py-2 px-3 text-left">Created</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold">{spec.title}</td>
                    <td className="py-2 px-3">{spec.produce_type}</td>
                    <td className="py-2 px-3">{spec.variety}</td>
                    <td className="py-2 px-3">{new Date(spec.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(spec)}>Edit</Button>
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