import { supabase } from '../integrations/supabase/client';

export const trackLead = async (data: {
  username_searched?: string;
  full_name?: string;
  profile_pic?: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: string;
  amount?: number; 
  city?: string;
  state?: string;
  ip_address?: string;
}) => {
  try {
    const userAgent = navigator.userAgent;
    const existingLeadId = sessionStorage.getItem('current_lead_id');
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // Se já temos um ID, tentamos o UPDATE
    if (existingLeadId) {
      console.log(`[tracking] Tentando atualizar lead: ${existingLeadId}`);
      const { error } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLeadId);
      
      // Se o erro for de permissão (42501) ou coluna inexistente, tentamos um novo INSERT
      if (!error) return;
      console.warn('[tracking] Falha no update, tentando novo insert:', error.message);
    }

    // Criar novo lead se não houver ID ou se o update falhou
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([{
        ...updateData,
        user_agent: userAgent
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[tracking] Erro fatal no insert:', insertError.message);
    } else if (newLead) {
      sessionStorage.setItem('current_lead_id', newLead.id);
    }
  } catch (err) {
    console.error('[tracking] Falha crítica:', err);
  }
};