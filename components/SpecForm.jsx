import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRODUCE_TYPES = [
  "Avocado", "Mango", "Banana", "Pineapple", "Coffee", "Tea", "Macadamia", "French Beans", "Snow Peas", "Passion Fruit"
];
const VARIETIES = ["Hass", "Fuerte", "Kent", "Tommy Atkins", "Other"];
const CERTIFICATIONS = ["Organic", "GlobalG.A.P.", "KEPHIS", "Fairtrade", "Rainforest Alliance"];
const SIZE_CODES = ["12", "14", "16", "18", "20", "22", "24"];

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

export default function SpecForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      onSubmit && onSubmit(form);
      alert("Spec saved (stub)");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Produce Specification Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: Produce Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title *</label>
                <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="e.g. EU Export Spec – Organic Hass Avocado" />
                {errors.title && <div className="text-xs text-red-500">{errors.title}</div>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Produce Type *</label>
                <select className="w-full border rounded p-2" value={form.produce_type} onChange={e => handleChange("produce_type", e.target.value)}>
                  <option value="">Select produce</option>
                  {PRODUCE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.produce_type && <div className="text-xs text-red-500">{errors.produce_type}</div>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Variety *</label>
                <select className="w-full border rounded p-2" value={form.variety} onChange={e => handleChange("variety", e.target.value)}>
                  <option value="">Select variety</option>
                  {VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
                {errors.variety && <div className="text-xs text-red-500">{errors.variety}</div>}
              </div>
            </div>
          )}
          {/* Step 1: Quality Requirements */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Dry Matter % *</label>
                <Input value={form.dry_matter} onChange={e => handleChange("dry_matter", e.target.value)} placeholder="e.g. ≥24%" />
                {errors.dry_matter && <div className="text-xs text-red-500">{errors.dry_matter}</div>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Grade *</label>
                <div className="flex flex-wrap gap-2">
                  {["Extra Class", "Class I", "Class II"].map((g) => (
                    <label key={g} className="flex items-center gap-1">
                      <Checkbox checked={form.grade.includes(g)} onCheckedChange={() => handleCheckbox("grade", g)} />
                      <span className="text-xs">{g}</span>
                    </label>
                  ))}
                </div>
                {errors.grade && <div className="text-xs text-red-500">{errors.grade}</div>}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Weight Min (g) *</label>
                  <Input type="number" value={form.weight_min} onChange={e => handleChange("weight_min", e.target.value)} placeholder="Min" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Weight Max (g) *</label>
                  <Input type="number" value={form.weight_max} onChange={e => handleChange("weight_max", e.target.value)} placeholder="Max" />
                </div>
              </div>
              {errors.weight && <div className="text-xs text-red-500">{errors.weight}</div>}
              <div>
                <label className="block text-xs font-medium mb-1">Size Code *</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_CODES.map((code) => (
                    <label key={code} className="flex items-center gap-1">
                      <Checkbox checked={form.size_code.includes(code)} onCheckedChange={() => handleCheckbox("size_code", code)} />
                      <span className="text-xs">{code}</span>
                    </label>
                  ))}
                </div>
                {errors.size_code && <div className="text-xs text-red-500">{errors.size_code}</div>}
              </div>
            </div>
          )}
          {/* Step 2: Certification Requirements */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <label key={cert} className="flex items-center gap-1">
                      <Checkbox checked={form.certifications.includes(cert)} onCheckedChange={() => handleCheckbox("certifications", cert)} />
                      <span className="text-xs">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Residue Limits</label>
                <Input value={form.residue_limits} onChange={e => handleChange("residue_limits", e.target.value)} placeholder="e.g. Below EU MRL" />
              </div>
            </div>
          )}
          {/* Step 3: Packaging & Labeling */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Packaging Type</label>
                <Input value={form.packaging_type} onChange={e => handleChange("packaging_type", e.target.value)} placeholder="e.g. 4kg ventilated carton" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Labeling Notes</label>
                <Input value={form.labeling} onChange={e => handleChange("labeling", e.target.value)} placeholder="e.g. Include variety, size, origin, traceability code" />
              </div>
            </div>
          )}
          {/* Step 4: Additional Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Additional Notes</label>
                <Input value={form.additional_notes} onChange={e => handleChange("additional_notes", e.target.value)} placeholder="e.g. Only export Hass between March and August to comply with seasonality" />
              </div>
            </div>
          )}
          {/* Stepper Controls */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={handleBack}>Back</Button>}
              {step < 4 && <Button type="button" onClick={handleNext}>Next</Button>}
              {step === 4 && <Button type="submit">Save Spec</Button>}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handlePreview}>Preview</Button>
              <Button type="button" variant="outline" onClick={handleExportPDF}>Export as PDF</Button>
              <Button type="button" variant="outline" onClick={handleSend}>Send to Farmer(s)</Button>
            </div>
          </div>
        </form>
        {/* Preview Modal (simple) */}
        {preview && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setPreview(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-2">Spec Preview</h3>
              <pre className="text-xs bg-gray-100 rounded p-2 overflow-x-auto max-h-96">{JSON.stringify(form, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 