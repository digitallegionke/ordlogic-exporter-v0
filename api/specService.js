import { supabase } from "@/lib/supabaseClient";

export async function saveProduceSpec(spec, clientId) {
  const insertObj = {
    client_id: clientId,
    title: spec.title,
    produce_type: spec.produce_type,
    variety: spec.variety,
    dry_matter: spec.dry_matter,
    grade: spec.grade,
    weight_min: spec.weight_min ? Number(spec.weight_min) : null,
    weight_max: spec.weight_max ? Number(spec.weight_max) : null,
    size_code: spec.size_code,
    certifications: spec.certifications,
    residue_limits: spec.residue_limits,
    packaging_type: spec.packaging_type,
    labeling: spec.labeling,
    additional_notes: spec.additional_notes,
  };
  const { data, error } = await supabase
    .from("produce_specs")
    .insert([insertObj])
    .select();
  if (error) throw error;
  return data[0];
}

export async function getProduceSpecs(clientId) {
  const { data, error } = await supabase
    .from("produce_specs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
} 