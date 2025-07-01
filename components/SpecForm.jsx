"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveProduceSpec } from "@/api/specService";
import { supabase } from "@/lib/supabaseClient";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";

const PRODUCE_TYPES = [
  "Avocado", "Mango", "Banana", "Pineapple", "Coffee", "Tea", "Macadamia", "French Beans", "Snow Peas", "Passion Fruit"
];
const VARIETIES = ["Hass", "Fuerte", "Kent", "Tommy Atkins", "Other"];
const CERTIFICATIONS = ["Organic", "GlobalG.A.P.", "KEPHIS", "Fairtrade", "Rainforest Alliance"];
const SIZE_CODES = ["12", "14", "16", "18", "20", "22", "24"];
const PACKAGING_TYPES = [
  "4kg ventilated carton",
  "10kg carton",
  "Plastic crate",
  "Net bag",
  "Wooden box",
  "Bulk bin",
  "Other"
];

const initialState = {
  title: "",
  produce_type: "",
  variety: "",
  dry_matter: "",
  grade: [],
  weight_min: "",
  weight_max: "",
  size_code: [],
  certifications: [],
  residue_limits: "",
  packaging_type: "",
  labeling: "",
  additional_notes: "",
};

const LOGO_URL = '/placeholder-logo.png'; // public/placeholder-logo.png

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12, fontFamily: 'Helvetica' },
  logo: { width: 120, height: 40, marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 },
  section: { marginBottom: 8 },
  label: { fontWeight: 'bold', marginBottom: 2 },
  value: { marginBottom: 4 },
  footer: { position: 'absolute', bottom: 24, left: 32, right: 32, textAlign: 'center', fontSize: 10, color: '#888' },
});

function SpecPDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={LOGO_URL} style={styles.logo} />
        <Text style={styles.heading}>Produce Specification</Text>
        <Text style={styles.sectionHeader}>General Information</Text>
        <View style={styles.section}><Text style={styles.label}>Produce Type:</Text> <Text style={styles.value}>{data.produceType}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Variety:</Text> <Text style={styles.value}>{data.variety}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Maturity Requirement:</Text> <Text style={styles.value}>{data.maturity}</Text></View>
        <Text style={styles.sectionHeader}>Quality & Grading</Text>
        <View style={styles.section}><Text style={styles.label}>Grade Requirement:</Text> <Text style={styles.value}>{data.grade && data.grade.length ? data.grade.join(', ') : ''}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Min Weight (g):</Text> <Text style={styles.value}>{data.minWeight}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Max Weight (g):</Text> <Text style={styles.value}>{data.maxWeight}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Size Codes:</Text> <Text style={styles.value}>{data.sizeCodes && data.sizeCodes.length ? data.sizeCodes.join(', ') : ''}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Minimum Size by Sea (g):</Text> <Text style={styles.value}>{data.minSeaSize}</Text></View>
        <Text style={styles.sectionHeader}>Certifications & Packaging</Text>
        <View style={styles.section}><Text style={styles.label}>Certifications:</Text> <Text style={styles.value}>{data.certifications && data.certifications.length ? data.certifications.join(', ') : ''}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Residue Limits:</Text> <Text style={styles.value}>{data.residueLimits}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Packaging:</Text> <Text style={styles.value}>{data.packaging}</Text></View>
        <View style={styles.section}><Text style={styles.label}>Labeling Instructions:</Text> <Text style={styles.value}>{data.labeling}</Text></View>
        <Text style={styles.sectionHeader}>Additional Notes</Text>
        <View style={styles.section}><Text style={styles.value}>{data.additionalNotes}</Text></View>
        <Text style={styles.footer}>OrdLogic Exporter Platform</Text>
      </Page>
    </Document>
  );
}

const STEPS = [
  "Produce Info",
  "Quality & Grading",
  "Certifications & Packaging",
  "Review & Export"
];

/**
 * @param {Object} props
 * @param {Function} props.onSubmit
 * @param {Object|null|undefined} [props.initialData]
 * @param {string} [props.mode]
 * @param {Function} [props.onClose]
 */
export default function SpecForm({ onSubmit, initialData = null, mode = "create", onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialData || initialState);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(initialState);
    }
    setStep(0);
    setErrors({});
    setPreview(false);
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleCheckbox = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };
  const validateStep = () => {
    let errs = {};
    if (step === 0) {
      if (!form.title) errs.title = "Required";
      if (!form.produce_type) errs.produce_type = "Required";
      if (!form.variety) errs.variety = "Required";
    }
    if (step === 1) {
      if (!form.dry_matter) errs.dry_matter = "Required";
      if (!form.grade.length) errs.grade = "Select at least one";
      if (!form.weight_min || !form.weight_max) errs.weight = "Required";
      if (!form.size_code.length) errs.size_code = "Select at least one";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);
  const handlePreview = () => setPreview(true);
  const handleExportPDF = () => alert("Export as PDF (stub)");
  const handleSend = () => alert("Send to Farmer(s) (stub)");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const clientId = user?.id || "11111111-2222-3333-4444-555555555555";
        await saveProduceSpec(form, clientId);
        toast.success('Specification saved to Supabase!');
        onSubmit && onSubmit(form);
        onClose && onClose();
      } catch (err) {
        toast.error('Failed to save specification.');
      }
    }
  };

  const handleWhatsApp = () => {
    let summary = `Produce Spec:\nType: ${form.produce_type}\nVariety: ${form.variety}\nGrade: ${form.grade?.join(', ')}\nCerts: ${form.certifications?.join(', ')}\nNotes: ${form.additional_notes}`;
    let url = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Card className="border border-border shadow-lg rounded-2xl bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 bg-muted/60 rounded-xl p-6">
              {STEPS.map((label, idx) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 border-2 transition-all duration-200
                        ${step === idx ? 'bg-black text-white border-black font-extrabold text-2xl' : 'bg-transparent text-gray-400 border-gray-300 font-bold text-2xl'}`}
                      aria-current={step === idx ? 'step' : undefined}
                    >
                      {idx + 1}
                    </div>
                    <span className={`mt-1 text-base text-center ${step === idx ? 'font-bold text-black' : 'font-medium text-gray-400'}`}>{label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-gray-200 rounded-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Step 0: Produce Info */}
            {step === 0 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-primary mb-4">Produce Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g. EU Export Spec – Organic Hass Avocado" className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.title ? 'border-red-500' : ''}`} />
                    {errors.title && <div className="text-xs text-red-500 mt-1">{errors.title}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Produce Type *</label>
                    <Select value={form.produce_type} onValueChange={v => handleChange("produce_type", v)}>
                      <SelectTrigger className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.produce_type ? 'border-red-500' : ''}`} >
                        <SelectValue placeholder="Select produce" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCE_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.produce_type && <div className="text-xs text-red-500 mt-1">{errors.produce_type}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Variety *</label>
                    <Select value={form.variety} onValueChange={v => handleChange("variety", v)}>
                      <SelectTrigger className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.variety ? 'border-red-500' : ''}`} >
                        <SelectValue placeholder="Select variety" />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIETIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.variety && <div className="text-xs text-red-500 mt-1">{errors.variety}</div>}
                  </div>
                </div>
              </div>
            )}
            {step === 0 && <Separator className="my-8" />}
            {/* Step 1: Quality Requirements */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-primary mb-4">Quality & Grading</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dry Matter % *</label>
                    <Input value={form.dry_matter} onChange={e => handleChange("dry_matter", e.target.value)} placeholder="e.g. ≥24%" className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.dry_matter ? 'border-red-500' : ''}`} />
                    {errors.dry_matter && <div className="text-xs text-red-500 mt-1">{errors.dry_matter}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grade *</label>
                    <div className="flex flex-wrap gap-2">
                      {["Extra Class", "Class I", "Class II"].map((g) => (
                        <label key={g} className="flex items-center gap-1">
                          <Checkbox checked={form.grade.includes(g)} onCheckedChange={() => handleCheckbox("grade", g)} />
                          <span className="text-xs">{g}</span>
                        </label>
                      ))}
                    </div>
                    {errors.grade && <div className="text-xs text-red-500 mt-1">{errors.grade}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Weight (g) *</label>
                    <Input type="number" value={form.weight_min} onChange={e => handleChange("weight_min", e.target.value)} className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.weight ? 'border-red-500' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Weight (g) *</label>
                    <Input type="number" value={form.weight_max} onChange={e => handleChange("weight_max", e.target.value)} className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.weight ? 'border-red-500' : ''}`} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Size Codes *</label>
                    <Select value={form.size_code[0] || ""} onValueChange={v => handleChange("size_code", [v])}>
                      <SelectTrigger className={`rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary ${errors.size_code ? 'border-red-500' : ''}`} >
                        <SelectValue placeholder="Select size code" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_CODES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.size_code && <div className="text-xs text-red-500 mt-1">{errors.size_code}</div>}
                  </div>
                </div>
              </div>
            )}
            {step === 1 && <Separator className="my-8" />}
            {/* Step 2: Certifications & Packaging */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-primary mb-4">Certifications & Packaging</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {CERTIFICATIONS.map((c) => (
                        <label key={c} className="flex items-center gap-1">
                          <Checkbox checked={form.certifications.includes(c)} onCheckedChange={() => handleCheckbox("certifications", c)} />
                          <span className="text-xs">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Residue Limits</label>
                    <Input value={form.residue_limits} onChange={e => handleChange("residue_limits", e.target.value)} placeholder="e.g. EU MRLs" className="rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Packaging Type</label>
                    <Select value={form.packaging_type} onValueChange={v => handleChange("packaging_type", v)}>
                      <SelectTrigger className="rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary" >
                        <SelectValue placeholder="Select packaging" />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGING_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Labeling Instructions</label>
                    <Input value={form.labeling} onChange={e => handleChange("labeling", e.target.value)} placeholder="e.g. Exporter name, batch, etc." className="rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <Input value={form.additional_notes} onChange={e => handleChange("additional_notes", e.target.value)} placeholder="Any extra requirements or notes" className="rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary" />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && <Separator className="my-8" />}
            {/* Step 3: Review & Export */}
            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-primary mb-4">Review & Export</h2>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Title</div>
                      <div className="font-medium">{form.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Produce Type</div>
                      <div className="font-medium">{form.produce_type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Variety</div>
                      <div className="font-medium">{form.variety}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Dry Matter %</div>
                      <div className="font-medium">{form.dry_matter}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Grade</div>
                      <div className="font-medium">{form.grade.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Weight Range (g)</div>
                      <div className="font-medium">{form.weight_min} - {form.weight_max}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Size Code</div>
                      <div className="font-medium">{form.size_code.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Certifications</div>
                      <div className="font-medium">{form.certifications.join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Residue Limits</div>
                      <div className="font-medium">{form.residue_limits}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Packaging Type</div>
                      <div className="font-medium">{form.packaging_type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Labeling</div>
                      <div className="font-medium">{form.labeling}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Additional Notes</div>
                      <div className="font-medium">{form.additional_notes}</div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-2 justify-end">
                    <PDFDownloadLink document={<SpecPDF data={form} />} fileName="produce-spec.pdf">
                      {({ loading }) => (
                        <Button variant="outline" className="min-w-[140px] flex items-center justify-center border-primary text-primary hover:bg-primary/10">{loading ? <span className="animate-spin mr-2">⏳</span> : <span className="mr-2">⬇️</span>}Download PDF</Button>
                      )}
                    </PDFDownloadLink>
                    <Button type="submit" className="min-w-[140px] flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>{saving ? <span className="animate-spin mr-2">⏳</span> : <span className="mr-2">💾</span>}Save to Supabase</Button>
                    <Input placeholder="Farmer WhatsApp Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-56 rounded-lg px-4 py-3 text-base bg-muted/40 placeholder:text-gray-400 focus:ring-2 focus:ring-primary border border-border focus:border-primary" />
                    <Button variant="secondary" onClick={handleWhatsApp} disabled={!phone} className="min-w-[180px] flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80"><span className="mr-2">📤</span>Send to Farmer via WhatsApp</Button>
                  </div>
                </div>
              </div>
            )}
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-10">
              {step > 0 && (
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBack}>Back</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleNext}>Next</Button>
              ) : (
                <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>{mode === "edit" ? "Save Changes" : "Save"}</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
} 