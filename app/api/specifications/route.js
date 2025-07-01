import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const produce_id = searchParams.get('produce_id');
  const market_id = searchParams.get('market_id');
  const variety_id = searchParams.get('variety_id');

  let query = supabase
    .from('specifications')
    .select(`
      *,
      spec_fields:spec_fields(*),
      certifications:certifications(*),
      packaging:packaging(*),
      cold_chain:cold_chain(*),
      variety_overrides:variety_spec_fields(variety_id, override_value)
    `)
    .eq('produce_id', produce_id)
    .eq('market_id', market_id)
    .eq('is_active', true);

  const { data, error } = await query.single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // If variety_id is provided, filter overrides
  let varietyOverrides = [];
  if (variety_id && data && data.variety_overrides) {
    varietyOverrides = data.variety_overrides.filter(vo => vo.variety_id === variety_id);
  }

  return new Response(JSON.stringify({
    ...data,
    variety_overrides: varietyOverrides
  }), { status: 200 });
} 