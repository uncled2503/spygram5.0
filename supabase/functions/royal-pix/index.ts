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
    // Você precisará configurar esta secret no painel do Supabase
    const ROYAL_TOKEN = Deno.env.get('ROYAL_BANKING_TOKEN');
    
    if (!ROYAL_TOKEN) {
      throw new Error('ROYAL_BANKING_TOKEN não configurado nas Secrets do Supabase.');
    }

    const { amount, name, email, document, description } = await req.json();

    // Chamada para a API da Royal Banking conforme documentação
    const response = await fetch('https://api.royalbanking.com.br/v1/pix/immediate-charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROYAL_TOKEN}`
      },
      body: JSON.stringify({
        calendar: {
          expiration: 3600 // 1 hora
        },
        amount: {
          original: amount.toFixed(2)
        },
        payer: {
          name: name,
          document: document.replace(/\D/g, ''), // Apenas números
          email: email
        },
        description: description || "Acesso SpyGram VIP"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[royal-pix] Erro API Royal:", data);
      throw new Error(data.message || 'Erro ao gerar PIX na Royal Banking');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[royal-pix] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})