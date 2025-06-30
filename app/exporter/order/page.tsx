"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const PRODUCE_TYPES = ["Avocado", "Mango", "Banana", "Pineapple", "Coffee", "Tea", "Macadamia", "French Beans", "Snow Peas", "Passion Fruit"];

export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([
    { produceType: "", quantity: "", deliveryDate: "", notes: "" },
  ]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showEntryDetailsDialog, setShowEntryDetailsDialog] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const handleEntryChange = (idx: number, field: string, value: string) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addEntry = () => {
    setEntries((prev) => ([...prev, { produceType: "", quantity: "", deliveryDate: "", notes: "" }]));
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");
      let exporter: { id: number } | null = null;
      let { data: exporterData, error: exporterError } = await supabase
        .from('exporters')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (exporterError && exporterError.code === 'PGRST116') {
        const { data: newExporter, error: createError } = await supabase
          .from('exporters')
          .insert({
            auth_user_id: user.id,
            company_name: user.email?.split('@')[0] || 'User Company',
            contact_person: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: null,
          })
          .select('id')
          .single();
        if (createError) throw new Error(`Failed to create user profile: ${createError.message}`);
        if (!newExporter) throw new Error("Failed to create user profile: No data returned");
        exporter = newExporter;
      } else if (exporterError) {
        throw new Error(`Failed to look up user profile: ${exporterError.message}`);
      } else {
        exporter = exporterData;
      }
      if (!exporter) throw new Error("Failed to find or create exporter profile");
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('exporter_orders')
        .insert({
          exporter_id: exporter.id,
          client_name: user.email?.split('@')[0] || 'Client',
        })
        .select()
        .single();
      if (orderError || !order) throw new Error(orderError?.message || "Order creation failed");
      // Insert all entries
      const entriesToInsert = entries.map(entry => ({
        order_id: order.id,
        produce_type: entry.produceType,
        expected_quantity: entry.quantity ? Number(entry.quantity) : null,
        delivery_date: entry.deliveryDate || null,
        special_notes: entry.notes,
      }));
      const { error: entryError } = await supabase
        .from('exporter_order_entries')
        .insert(entriesToInsert);
      if (entryError) throw new Error(entryError.message);
      toast.success("Order(s) submitted successfully!");
      setEntries([{ produceType: "", quantity: "", deliveryDate: "", notes: "" }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      // Get exporter
      const { data: exporter, error: exporterError } = await supabase
        .from('exporters')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (!exporter) return;
      // Get orders for this exporter
      const { data: orderRows, error: orderError } = await supabase
        .from('exporter_orders')
        .select('id, created_at, exporter_id, exporter_order_entries(produce_type, expected_quantity, delivery_date, special_notes)')
        .eq('exporter_id', exporter.id)
        .order('created_at', { ascending: false });
      if (orderError) return;
      setOrders(orderRows || []);
    };
    fetchOrders();
  }, []);

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Order</h1>
            <p className="text-gray-600">Submit a new produce order</p>
          </div>
          <Button onClick={() => setShowNewOrderDialog(true)} variant="default">+ New Order</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-gray-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden shadow-sm">
                  <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b">Order Date</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Produce Type</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Quantity (kg)</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Delivery Date</th>
                      <th className="px-4 py-3 text-left font-semibold border-b">Notes</th>
                      <th className="px-4 py-3 text-center font-semibold border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      order.exporter_order_entries.map((entry: any, idx: number) => (
                        <tr
                          key={order.id + '-' + idx}
                          className={
                            idx % 2 === 0
                              ? "bg-gray-50 hover:bg-green-50 transition"
                              : "bg-white hover:bg-green-50 transition"
                          }
                        >
                          <td className="px-4 py-3 border-b">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 border-b">{entry.produce_type}</td>
                          <td className="px-4 py-3 border-b">{entry.expected_quantity}</td>
                          <td className="px-4 py-3 border-b">{entry.delivery_date ? new Date(entry.delivery_date).toLocaleDateString() : ''}</td>
                          <td className="px-4 py-3 border-b">{entry.special_notes}</td>
                          <td className="px-4 py-3 border-b text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => { setSelectedEntry({ ...entry, orderDate: order.created_at }); setShowEntryDetailsDialog(true); }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Order Details Dialog for New Order */}
        <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Fill in the details for your new order.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => {
              await handleSubmit(e);
              setShowNewOrderDialog(false);
            }} className="space-y-6">
              {entries.map((entry, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`produceType-${idx}`}>Produce Type *</Label>
                      <Select
                        value={entry.produceType}
                        onValueChange={(value) => handleEntryChange(idx, 'produceType', value)}
                      >
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
                      <Label htmlFor={`quantity-${idx}`}>Quantity (kg)</Label>
                      <Input
                        id={`quantity-${idx}`}
                        type="number"
                        value={entry.quantity}
                        onChange={(e) => handleEntryChange(idx, 'quantity', e.target.value)}
                        placeholder="Enter quantity in kg"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`deliveryDate-${idx}`}>Preferred Delivery Date</Label>
                      <Input
                        id={`deliveryDate-${idx}`}
                        type="date"
                        value={entry.deliveryDate}
                        onChange={(e) => handleEntryChange(idx, 'deliveryDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`notes-${idx}`}>Additional Notes</Label>
                      <Textarea
                        id={`notes-${idx}`}
                        value={entry.notes}
                        onChange={(e) => handleEntryChange(idx, 'notes', e.target.value)}
                        placeholder="Any special requirements or notes..."
                        rows={4}
                      />
                    </div>
                  </div>
                  {entries.length > 1 && (
                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEntry(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEntry} className="mb-2">+ Add Another Entry</Button>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || entries.some(e => !e.produceType)}
                >
                  {loading ? "Submitting..." : "Submit Orders"}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="w-full">Cancel</Button>
                </DialogClose>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Order Details Dialog */}
        <Dialog open={showEntryDetailsDialog} onOpenChange={setShowEntryDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Entry Details</DialogTitle>
              <DialogDescription>
                Detailed information for this order entry.
              </DialogDescription>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-2">
                <div><b>Order Date:</b> {new Date(selectedEntry.orderDate).toLocaleDateString()}</div>
                <div><b>Produce Type:</b> {selectedEntry.produce_type}</div>
                <div><b>Quantity (kg):</b> {selectedEntry.expected_quantity}</div>
                <div><b>Delivery Date:</b> {selectedEntry.delivery_date ? new Date(selectedEntry.delivery_date).toLocaleDateString() : ''}</div>
                <div><b>Notes:</b> {selectedEntry.special_notes}</div>
              </div>
            )}
            <DialogClose asChild>
              <Button className="mt-4 w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}