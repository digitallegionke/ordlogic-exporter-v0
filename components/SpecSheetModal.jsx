import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  "Produce Info",
  "Quality & Grading",
  "Certifications & Packaging",
  "Review & Export",
];

function Stepper({ step, setStep }) {
  return (
    <div className="flex justify-between items-start self-stretch mb-6">
      {STEPS.map((label, idx) => (
        <div
          key={label}
          className={`flex flex-col justify-start items-center gap-[13px] cursor-pointer ${step === idx ? '' : 'opacity-30'}`}
          onClick={() => idx < step && setStep(idx)}
        >
          <div className="flex flex-col justify-center items-center h-[30px] w-[30px] rounded-[66.67px] bg-black">
            <p className="w-[13.33px] text-[12.5px] font-bold text-center text-white">{idx + 1}</p>
          </div>
          <p className="w-[136px] text-[10px] font-semibold text-center text-black">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SpecSheetStep1({ form, setForm, errors }) {
  // TODO: Add fields for Produce Info
  return <div>Step 1: Produce Info (fields go here)</div>;
}
function SpecSheetStep2({ form, setForm, errors }) {
  // TODO: Add fields for Quality & Grading
  return <div>Step 2: Quality & Grading (fields go here)</div>;
}
function SpecSheetStep3({ form, setForm, errors }) {
  // TODO: Add fields for Certifications & Packaging
  return <div>Step 3: Certifications & Packaging (fields go here)</div>;
}
function SpecSheetStep4({ form }) {
  // TODO: Add review/export summary and actions
  return <div>Step 4: Review & Export (summary goes here)</div>;
}

const initialForm = {
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

export default function SpecSheetModal({ open, onOpenChange }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // TODO: Add validation and navigation logic

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[584px] p-5 rounded-lg bg-white">
        <DialogTitle className="sr-only">Produce Specification Document</DialogTitle>
        <div className="flex flex-col gap-[23px]">
          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold text-black">Produce Specification Document</p>
            <p className="text-xs font-medium text-[#484848]">Fill in the Specification Document as an accurate guide for the farmer</p>
          </div>
          <Stepper step={step} setStep={setStep} />
          {step === 0 && <SpecSheetStep1 form={form} setForm={setForm} errors={errors} />}
          {step === 1 && <SpecSheetStep2 form={form} setForm={setForm} errors={errors} />}
          {step === 2 && <SpecSheetStep3 form={form} setForm={setForm} errors={errors} />}
          {step === 3 && <SpecSheetStep4 form={form} />}
          <div className="flex justify-between mt-6">
            {step > 0 && (
              <button type="button" className="px-8 py-2.5 rounded-lg border border-black text-black bg-white text-sm font-semibold" onClick={() => setStep(step - 1)}>Back</button>
            )}
            <div className="flex gap-2 ml-auto">
              {step < 3 && (
                <button type="button" className="px-12 py-2.5 rounded-lg bg-black text-white text-sm font-semibold" onClick={() => setStep(step + 1)}>Next</button>
              )}
              {step === 3 && (
                <>
                  <button type="button" className="px-8 py-2.5 rounded-lg border border-black text-black bg-white text-sm font-semibold">Download PDF</button>
                  <button type="button" className="px-8 py-2.5 rounded-lg bg-black text-white text-sm font-semibold">Save</button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 