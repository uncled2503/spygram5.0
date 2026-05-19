import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Usamos a Service Role para ignorar RLS e deletar tudo
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { leadId } = await req.json()

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Lead ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[delete-lead] Tentando excluir lead: ${leadId}`);

    // 1. Deletar pagamentos vinculados (segurança extra caso o CASCADE falhe)
    await supabase.from('payments').delete().eq('lead_id', leadId);

    // 2. Deletar o lead
    const { error, count } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;

    console.log(`[delete-lead] Lead ${leadId} excluído com sucesso.`);

    return new Response(JSON.stringify({ success: true, deleted: count }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[delete-lead] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})