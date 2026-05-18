import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ROYAL_BANKING_TOKEN = Deno.env.get('ROYAL_BANKING_TOKEN')
    if (!ROYAL_BANKING_TOKEN) {
      console.error("[royal-banking-payment] ROYAL_BANKING_TOKEN não configurada.");
      throw new Error('Configuração de token pendente.')
    }

    const { name, email, document, phone, amount } = await req.json()

    // Higienização de documentos e telefone (apenas números)
    const cleanDocument = document.replace(/\D/g, '');
    const cleanPhone = phone.replace(/\D/g, '');

    // Payload estruturado conforme a documentação Royal Banking – Cash In
    const payload = {
      "api-key": ROYAL_BANKING_TOKEN,
      "amount": amount, // Valor em reais como número (ex: 29.90)
      "client": {
        "name": name,
        "document": cleanDocument,
        "telefone": cleanPhone,
        "email": email
      },
      "callbackUrl": 'https://wdxgxbvrealcalipuzay.supabase.co/functions/v1/payment-webhook'
    }

    console.log("[royal-banking-payment] Solicitando Depósito (Cash In) para Royal Banking...");

    const response = await fetch('https://api.royalbanking.com.br/v1/gateway/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || data.status === 'failed') {
      console.error("[royal-banking-payment] Erro na Resposta:", data);
      return new Response(JSON.stringify({ 
        error: data.message || 'Erro ao processar Cash In na Royal Banking',
        details: data
      }), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Retorna os dados do Pix (paymentCode, paymentCodeBase64, idTransaction)
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[royal-banking-payment] Falha crítica:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})