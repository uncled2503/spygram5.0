import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, QrCode, Check, Clock } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CPUD1S';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix'>('pix');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmEmail: '',
    whatsapp: '',
    documento: ''
  });
  
  const [bumps, setBumps] = useState({
    pro: false,
    social: false,
    recover: false,
    track: false
  });

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const basePrice = 29.90;
  
  const bumpDetails = {
    pro: { price: 9.90 },
    social: { price: 19.90 },
    recover: { price: 15.90 },
    track: { price: 15.90 }
  };

  const calculateAdicionais = () => {
    let total = 0;
    if (bumps.pro) total += bumpDetails.pro.price;
    if (bumps.social) total += bumpDetails.social.price;
    if (bumps.recover) total += bumpDetails.recover.price;
    if (bumps.track) total += bumpDetails.track.price;
    return total;
  };

  const adicionais = calculateAdicionais();
  const total = basePrice + adicionais;

  const handleToggleBump = (key: keyof typeof bumps) => {
    setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinalize = () => {
    sessionStorage.setItem('hasPurchased', 'true');
    window.location.href = CHECKOUT_URL;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'whatsapp') {
      formattedValue = value.replace(/\D/g, "").substring(0, 11);
    } else if (name === 'documento') {
      formattedValue = value.replace(/\D/g, "").substring(0, 14);
    }
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-10">
      <SalesNotification />
      
      {/* Timer Bar */}
      <div className="w-full bg-red-600 text-white py-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 animate-pulse" />
        Oferta expira em: <span className="font-mono text-sm">{formatTimer(timeLeft)}</span>
      </div>

      {/* Topbar */}
      <div className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider font-semibold">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </button>
        <span className="text-xs tracking-widest text-gray-400 font-bold uppercase">Pagamento Seguro</span>
        <Lock className="w-4 h-4 text-gray-400" />
      </div>

      {/* Banner Principal */}
      <div className="w-full relative flex flex-col items-center pt-10 pb-10 px-4 border-b border-gray-100 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none select-none">
          <img src="/banner-topo.png" alt="" className="w-full max-w-4xl h-auto object-contain scale-[1.15] blur-[50px] opacity-30" />
        </div>
        <img src="/banner-topo.png" alt="12 mil pessoas aprovam o SpyGram" className="w-full max-w-4xl h-auto object-contain relative z-10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulários */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold border border-gray-200">1</div>
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Dados Pessoais</h2>
              </div>
              <div className="space-y-4">
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="NOME COMPLETO" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-MAIL" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-gray-400" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="WHATSAPP" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-gray-400" />
                  <input type="tel" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF/CNPJ" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-gray-400" />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold border border-gray-200">2</div>
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Pagamento</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button disabled className="flex flex-col items-center p-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"><CreditCard className="w-6 h-6 mb-2" /><span className="text-xs font-bold uppercase">Cartão</span></button>
                <button onClick={() => setPaymentMethod('pix')} className="flex flex-col items-center p-4 rounded-lg border bg-purple-50 border-purple-200 text-purple-700 shadow-sm"><QrCode className="w-6 h-6 mb-2" /><span className="text-xs font-bold uppercase">PIX</span></button>
              </div>
            </section>

            {/* Order Bumps */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 uppercase mb-4 text-center">Melhore seu plano</h2>
              <div className="space-y-3">
                {Object.keys(bumps).map((key) => (
                  <div key={key} onClick={() => handleToggleBump(key as keyof typeof bumps)} className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${bumps[key as keyof typeof bumps] ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-xs font-bold uppercase text-gray-800">{key === 'pro' ? 'SpyGram Vitalício' : key === 'social' ? 'Espião WhatsApp/Face' : key === 'recover' ? 'Recuperar Apagadas' : 'Rastreamento 24h'}</span>
                    <span className="text-green-600 font-bold text-sm">+ R$ {bumpDetails[key as keyof typeof bumps].price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-6 shadow-sm">
              <img src="/logoapp.png" alt="SpyGram" className="w-40 h-40 mx-auto mb-6 object-contain" />
              
              <h2 className="text-lg font-black text-gray-900 uppercase mb-6 border-b border-gray-200 pb-4">Resumo</h2>
              <div className="space-y-3 text-sm mb-6 text-gray-600">
                <div className="flex justify-between"><span>Plano Completo</span><span>R$ {basePrice.toFixed(2)}</span></div>
                {adicionais > 0 && <div className="flex justify-between text-purple-600 font-medium"><span>Adicionais</span><span>+ R$ {adicionais.toFixed(2)}</span></div>}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-black text-purple-700">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button onClick={handleFinalize} className="w-full py-4 rounded-lg font-black text-white uppercase bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-md transition-all">Finalizar Compra</button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                <Lock className="w-3 h-3" />
                Pagamento 100% Criptografado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;