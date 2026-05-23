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
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { leadId, action, amount } = await req.json()

    if (!leadId || !action) {
      return new Response(JSON.stringify({ error: 'leadId e action são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[manage-credits] Ação: ${action} para o lead: ${leadId}`);

    if (action === 'add') {
      // Adiciona um registro de crédito aprovado
      const { error } = await supabase
        .from('payments')
        .insert({
          transaction_id: `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lead_id: leadId,
          status: 'approved',
          payload: { amount: parseFloat(amount) }
        });

      if (error) throw error;
      console.log(`[manage-credits] Créditos de R$ ${amount} adicionados com sucesso.`);
      return new Response(JSON.stringify({ success: true, message: 'Créditos adicionados com sucesso!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'remove') {
      // Remove todos os registros de pacotes de crédito do lead
      const { data: payments, error: selectError } = await supabase
        .from('payments')
        .select('id, payload')
        .eq('lead_id', leadId);

      if (selectError) throw selectError;

      // Filtra e deleta apenas os pagamentos de créditos (49.50, 79.50, 149.00)
      const creditPaymentIds = payments
        ?.filter(p => {
          const payAmt = Number(p.payload?.amount) || 0;
          return payAmt === 49.50 || payAmt === 79.50 || payAmt === 149.00;
        })
        .map(p => p.id) || [];

      if (creditPaymentIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('payments')
          .delete()
          .in('id', creditPaymentIds);

        if (deleteError) throw deleteError;
      }

      console.log(`[manage-credits] Todos os créditos foram removidos com sucesso.`);
      return new Response(JSON.stringify({ success: true, message: 'Todos os créditos foram removidos!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Ação inválida.');
  } catch (error) {
    console.error("[manage-credits] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})