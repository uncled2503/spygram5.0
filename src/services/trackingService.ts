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
    // Se este lead foi marcado como deletado pelo admin nesta sessão, paramos tudo.
    if (sessionStorage.getItem('is_deleted_lead') === 'true') {
      console.log('[tracking] Rastreamento bloqueado: Lead excluído pelo administrador.');
      return;
    }

    const userAgent = navigator.userAgent;
    let existingLeadId = sessionStorage.getItem('current_lead_id');
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.total_amount = data.amount;
      delete updateData.amount;
    }

    // Tenta atualizar se já existir um ID
    if (existingLeadId) {
      const { error, count } = await supabase
        .from('leads')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        }, { count: 'exact' })
        .eq('id', existingLeadId);
      
      // Se alterou com sucesso, encerra.
      if (!error && count && count > 0) return;

      // Se o count for 0, o registro não existe mais no banco (foi excluído pelo admin)
      if (!error && count === 0) {
        console.warn('[tracking] Lead não encontrado no banco. Marcando como excluído.');
        // Marcamos a sessão para nunca mais tentar criar/atualizar este lead
        sessionStorage.setItem('is_deleted_lead', 'true');
        sessionStorage.removeItem('current_lead_id');
        return;
      }
    }

    // Só cria um novo se não houver ID e não estiver marcado como deletado
    if (!existingLeadId && (data.status === 'pesquisou' || data.email)) {
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([{
          ...updateData,
          user_agent: userAgent
        }])
        .select()
        .single();

      if (!insertError && newLead) {
        sessionStorage.setItem('current_lead_id', newLead.id);
      }
    }
  } catch (err) {
    console.error('[tracking] Erro crítico:', err);
  }
};