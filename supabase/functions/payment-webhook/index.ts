import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Responde a requisições OPTIONS para o CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Lê o payload enviado pela Royal Banking
    const payload = await req.json()
    console.log("[payment-webhook] Payload recebido:", JSON.stringify(payload));

    // A documentação menciona idTransaction e externalReference
    const transactionId = String(payload.idTransaction || payload.externalReference);
    const status = payload.status;

    if (!transactionId || !status) {
      console.error("[payment-webhook] Dados insuficientes no payload.");
      return new Response(JSON.stringify(400), { status: 400 });
    }

    // 1. Atualiza o status na tabela de pagamentos
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: status,
        payload: payload,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .select('lead_id')
      .single();

    if (paymentError) {
      console.error("[payment-webhook] Erro ao atualizar pagamento:", paymentError.message);
    }

    // 2. Se o status for 'paid' (Cash In), 'SaquePago' (Cash Out) ou 'approved'/'success'
    // Atualizamos o lead para liberar o acesso
    const isPaid = ['paid', 'SaquePago', 'approved', 'success'].includes(status);

    if (paymentData?.lead_id && isPaid) {
      console.log(`[payment-webhook] Confirmando lead: ${paymentData.lead_id} por transação ${transactionId}`);
      
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'pagou' })
        .eq('id', paymentData.lead_id);

      if (leadError) {
        console.error("[payment-webhook] Erro ao atualizar lead:", leadError.message);
      }
    } else {
      console.warn(`[payment-webhook] Pagamento ${transactionId} não resultou em liberação (Lead: ${paymentData?.lead_id || 'N/A'}, Status: ${status})`);
    }

    // A documentação exige retorno imediato de HTTP 200 com json_encode(200)
    // No Deno/JS, JSON.stringify(200) retorna a string "200"
    return new Response(JSON.stringify(200), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[payment-webhook] Falha crítica:", error.message)
    // Mesmo em erro de processamento, retornar 500 para permitir que a Royal Banking tente novamente (retry)
    return new Response(JSON.stringify(500), { status: 500 })
  }
})