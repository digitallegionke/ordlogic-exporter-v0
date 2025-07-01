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
      <DialogTitle className="sr-only">Produce Specification Document</DialogTitle>
      <div className="flex flex-col justify-start items-end w-full max-w-[584px] sm:w-[584px] overflow-hidden gap-[23px] p-0 rounded-lg bg-white transition-all duration-300 ease-in-out">
        {/* Title and subtitle */}
        <div className="flex flex-col justify-start items-start self-stretch gap-1">
          <p className="self-stretch w-[544px] text-xl font-semibold text-left text-black">Produce Specification Document</p>
          <p className="self-stretch w-[544px] text-xs font-medium text-left text-[#484848]">Fill in the Specification Document as an accurate guide for the farmer</p>
        </div>
        {/* Stepper */}
        <div className="flex justify-between items-start self-stretch">
          {STEPS.map((label, idx) => (
            <div key={label} className={`flex flex-col justify-start items-center gap-[13px] ${step === idx ? '' : 'opacity-30'}`}> 
              <div className="flex flex-col justify-center items-center h-[30px] w-[30px] rounded-[66.67px] bg-black">
                <p className="w-[13.33px] text-[12.5px] font-bold text-center text-white">{idx + 1}</p>
              </div>
              <p className="w-[136px] text-[10px] font-semibold text-center text-black">{label}</p>
            </div>
          ))}
        </div>
        {/* Step 1: Produce Info */}
        {step === 0 && (
          <div className="flex justify-start items-center self-stretch gap-2">
            <div className="flex flex-col items-start w-[544px] gap-2">
              <p className="text-xs font-semibold text-left text-black">Title*</p>
              <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                <input className="w-full text-xs font-semibold text-[#484848]/30 bg-transparent outline-none" placeholder="e.g. EU Export Spec - Organic Hass Avocado" value={form.title} onChange={e => handleChange('title', e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col items-start w-[268px] gap-2">
              <p className="text-xs font-semibold text-left text-black">Produce Type*</p>
              <div className="flex justify-between items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                <select className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" value={form.produce_type} onChange={e => handleChange('produce_type', e.target.value)}>
                  <option value="">Produce Type</option>
                  {PRODUCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col items-start w-[268px] gap-2">
              <p className="text-xs font-semibold text-left text-black">Variety*</p>
              <div className="flex justify-between items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                <select className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" value={form.variety} onChange={e => handleChange('variety', e.target.value)}>
                  <option value="">Select variety</option>
                  {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Quality & Grading */}
        {step === 1 && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-4">
              <div className="flex flex-col w-[268px] gap-2">
                <p className="text-xs font-semibold text-left text-black">Grade*</p>
                <div className="flex gap-2">
                  {['Extra Class', 'Class I', 'Class 2'].map(g => (
                    <label key={g} className="flex items-center gap-1">
                      <input type="checkbox" checked={form.grade.includes(g)} onChange={() => handleCheckbox('grade', g)} className="accent-black" />
                      <span className="text-xs font-medium text-[#484848]">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col w-[268px] gap-2">
                <p className="text-xs font-semibold text-left text-black">Dry Matter %*</p>
                <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                  <input className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" placeholder="e.g. 24%" value={form.dry_matter} onChange={e => handleChange('dry_matter', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col w-[268px] gap-2">
                <p className="text-xs font-semibold text-left text-black">Min Weight (g)*</p>
                <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                  <input type="number" className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" placeholder="0" value={form.weight_min} onChange={e => handleChange('weight_min', e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col w-[268px] gap-2">
                <p className="text-xs font-semibold text-left text-black">Max Weight (g)*</p>
                <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10">
                  <input type="number" className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" placeholder="0" value={form.weight_max} onChange={e => handleChange('weight_max', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full gap-2">
              <p className="text-xs font-semibold text-left text-black">Size Codes*</p>
              <div className="flex gap-2">
                {SIZE_CODES.map(code => (
                  <label key={code} className="flex items-center gap-1">
                    <input type="checkbox" checked={form.size_code.includes(code)} onChange={() => handleCheckbox('size_code', code)} className="accent-black" />
                    <span className="text-xs font-medium text-[#484848]">{code}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Certifications & Packaging */}
        {step === 2 && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-left text-black">Certifications</p>
              <div className="flex gap-2 flex-wrap">
                {CERTIFICATIONS.map(cert => (
                  <label key={cert} className="flex items-center gap-1">
                    <input type="checkbox" checked={form.certifications.includes(cert)} onChange={() => handleCheckbox('certifications', cert)} className="accent-black" />
                    <span className="text-xs font-medium text-[#484848]">{cert}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-left text-black">Packaging Type</p>
              <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10 max-w-[268px]">
                <select className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" value={form.packaging_type} onChange={e => handleChange('packaging_type', e.target.value)}>
                  <option value="">Select packaging</option>
                  {PACKAGING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-left text-black">Labeling Instructions</p>
              <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10 max-w-[544px]">
                <input className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" placeholder="e.g. EU Export Spec – Organic Hass Avocado" value={form.labeling} onChange={e => handleChange('labeling', e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-left text-black">Additional Notes</p>
              <div className="flex items-center w-full px-4 py-2.5 rounded-md border border-black/10 max-w-[544px]">
                <input className="w-full text-xs font-medium text-[#484848] bg-transparent outline-none" placeholder="Any extra requirements or notes" value={form.additional_notes} onChange={e => handleChange('additional_notes', e.target.value)} />
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Review & Export */}
        {step === 3 && (
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Title</div>
                  <div className="font-medium text-black">{form.title}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Produce Type</div>
                  <div className="font-medium text-black">{form.produce_type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Variety</div>
                  <div className="font-medium text-black">{form.variety}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Dry Matter %</div>
                  <div className="font-medium text-black">{form.dry_matter}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Grade</div>
                  <div className="font-medium text-black">{form.grade.join(', ')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight Range (g)</div>
                  <div className="font-medium text-black">{form.weight_min} - {form.weight_max}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Size Code</div>
                  <div className="font-medium text-black">{form.size_code.join(', ')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Certifications</div>
                  <div className="font-medium text-black">{form.certifications.join(', ')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Packaging Type</div>
                  <div className="font-medium text-black">{form.packaging_type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Labeling</div>
                  <div className="font-medium text-black">{form.labeling}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Additional Notes</div>
                  <div className="font-medium text-black">{form.additional_notes}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="px-8 py-2.5 rounded-lg border border-black text-black bg-white text-sm font-semibold" onClick={() => {/* PDF Download logic */}}>Download PDF</button>
              <button type="submit" className="px-8 py-2.5 rounded-lg bg-black text-white text-sm font-semibold">Save</button>
            </div>
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-6">
          {step > 0 && (
            <button type="button" className="px-8 py-2.5 rounded-lg border border-black text-black bg-white text-sm font-semibold" onClick={handleBack}>Back</button>
          )}
          <div className="flex gap-2 ml-auto">
            {step < 3 && (
              <button type="button" className="px-12 py-2.5 rounded-lg bg-black text-white text-sm font-semibold" onClick={handleNext}>Next</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 