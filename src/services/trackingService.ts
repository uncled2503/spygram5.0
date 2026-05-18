import { supabase } from '../integrations/supabase/client';

export const trackLead = async (data: {
  username_searched?: string;
  full_name?: string;
  profile_pic?: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: string;
  amount?: number; // Valor vindo do checkout
  city?: string;
  state?: string;
}) => {
  try {
    const userAgent = navigator.userAgent;
    
    // Tenta recuperar ID do lead da sessão para atualizar o mesmo registro
    const existingLeadId = sessionStorage.getItem('current_lead_id');

    // Mapeia 'amount' para 'total_amount' do banco de dados
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    if (existingLeadId) {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLeadId);
      
      if (error) console.error('Erro ao atualizar lead:', error);
    } else {
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert([{
          ...updateData,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar lead:', error);
      } else if (newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
      }
    }
  } catch (err) {
    console.error('Falha no rastreamento:', err);
  }
};