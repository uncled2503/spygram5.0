import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, QrCode, Check, Clock, Star, Mail, ShieldCheck, ChevronRight, Smartphone, Banknote } from 'lucide-react';
import SalesNotification from '../components/SalesNotification';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CPUD1S';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'boleto' | 'picpay'>('pix');
  const [timeLeft, setTimeLeft] = useState(289); // 04:49 inicial conforme imagem
  
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
    pro: { 
      title: 'ADQUIRIR TAMBÉM ACESSO VITALÍCIO AO SPYGRAM PRO', 
      price: 9.90, 
      img: '/order-bumps/vitalicio.jpg',
      desc: 'Tenha acesso permanente a ferramenta SpyGram PRO!'
    },
    social: { 
      title: 'ADQUIRIR TAMBÉM ESPIÃO INSTAGRAM + FACEBOOK + WHATSAPP', 
      price: 19.90, 
      img: '/order-bumps/social.jpg',
      desc: 'Tenha acesso a todas as redes sociais de quem você quiser!'
    },
    recover: { 
      title: 'ADQUIRIR TAMBÉM RECUPERADOR DE MENSAGENS APAGADAS', 
      price: 15.90, 
      img: '/order-bumps/recover.jpg',
      desc: 'Recupere todas as mensagens apagadas do Instagram!'
    },
    track: { 
      title: 'ADQUIRIR TAMBÉM RASTREAMENTO 24 HORAS', 
      price: 15.90, 
      img: '/order-bumps/track.jpg',
      desc: 'Rastreie a pessoa que quiser usando somente o celular por tempo ilimitado! Saiba cada passo dela!'
    }
  };

  const adicionais = Object.keys(bumps).reduce((acc, key) => {
    return bumps[key as keyof typeof bumps] ? acc + bumpDetails[key as keyof typeof bumps].price : acc;
  }, 0);

  const total = basePrice + adicionais;

  const handleToggleBump = (key: keyof typeof bumps) => {
    setBumps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskPhone = (value: string) => value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const maskCPFCNPJ = (value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length <= 11) return raw.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return raw.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'whatsapp') formattedValue = maskPhone(value);
    else if (name === 'documento') formattedValue = maskCPFCNPJ(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans pb-20">
      <SalesNotification />
      
      {/* Top Countdown Banner */}
      <div className="w-full bg-[#f15c5c] text-white py-2.5 text-center text-[13px] font-bold uppercase flex items-center justify-center gap-2 px-4">
        <span>ESSA PROMOÇÃO SE ENCERRA AO ZERAR O CRONÔMETRO!</span>
        <div className="flex items-center gap-1.5 ml-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-base">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full bg-[#f4f4f4] pt-8 pb-4 px-4 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
            <div className="relative">
                <img src="/banner-topo.png" alt="People using SpyGram" className="w-full max-w-[500px] h-auto" />
            </div>
            <div className="flex flex-col items-center md:items-end">
                <img src="/spygram_transparentebranco.png" alt="SpyGram Logo" className="h-20 mb-4 brightness-0" />
            </div>
        </div>
        
        <div className="text-center mt-6">
            <h1 className="text-2xl md:text-3xl font-black text-[#111] mb-2">+12,3mil pessoas utilizam e aprovam o SpyGram®.</h1>
            <p className="text-[#666] text-sm md:text-base max-w-2xl font-medium">
                Este aplicativo foi testado e aprovado por profissionais, contando com o selo de confiança 'Google Reviews'.
            </p>
        </div>

        {/* Google Reviews Seal */}
        <div className="w-full max-w-3xl mt-8 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg" alt="Google" className="w-10 h-10" />
                <div className="text-left">
                    <p className="text-lg font-black text-[#444] uppercase leading-tight">GOOGLE REVIEWS:</p>
                    <p className="text-lg font-black text-[#444]">(12,3mil) Avaliações</p>
                </div>
            </div>
            <div className="flex flex-col items-center md:items-end mt-4 md:mt-0">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-6 h-6 ${i === 4 ? 'text-gray-300' : 'text-yellow-400 fill-yellow-400'}`} />)}
                    <span className="text-xl font-bold text-[#444] ml-2">(4,9)</span>
                </div>
            </div>
        </div>

        {/* Acquiring Bar */}
        <div className="w-full max-w-3xl mt-4 bg-white border border-gray-100 rounded-lg py-2.5 px-4 flex items-center gap-3 text-[#666] text-[11px] font-bold uppercase shadow-sm">
            <div className="p-1.5 bg-gray-100 rounded">
                <Smartphone className="w-4 h-4" />
            </div>
            <span>VOCÊ ESTÁ ADQUIRINDO: Relatório SpyGram Completo</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Column */}
        <div className="flex-1 space-y-8">
          
          {/* Step 1: Personal Data */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-[#f4f4f4] px-6 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">DADOS PESSOAIS</h2>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1.5 block uppercase">Nome completo</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Digite seu nome completo" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1.5 block uppercase">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1.5 block uppercase">Telefone</label>
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Telefone" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                </div>
            </div>
          </section>

          {/* Step 2: Payment */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-[#f4f4f4] px-6 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">PAGAMENTO</h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <button onClick={() => setPaymentMethod('cartao')} className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border-2 text-[11px] font-bold uppercase transition-all ${paymentMethod === 'cartao' ? 'bg-white border-purple-500 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        <CreditCard className="w-4 h-4" /> Cartão de Crédito
                    </button>
                    <button onClick={() => setPaymentMethod('boleto')} className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border-2 text-[11px] font-bold uppercase transition-all ${paymentMethod === 'boleto' ? 'bg-white border-purple-500 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        <Banknote className="w-4 h-4" /> Boleto
                    </button>
                    <button onClick={() => setPaymentMethod('pix')} className={`relative flex items-center justify-center gap-2 p-3.5 rounded-lg border-2 text-[11px] font-bold uppercase transition-all ${paymentMethod === 'pix' ? 'bg-white border-purple-500 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        <QrCode className="w-4 h-4" /> Pix
                        {paymentMethod === 'pix' && <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>}
                    </button>
                    <button onClick={() => setPaymentMethod('picpay')} className={`flex items-center justify-center gap-2 p-3.5 rounded-lg border-2 text-[11px] font-bold uppercase transition-all ${paymentMethod === 'picpay' ? 'bg-white border-purple-500 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                        PicPay
                    </button>
                </div>

                {paymentMethod === 'pix' && (
                    <div className="space-y-4 border-t border-gray-100 pt-6">
                        <div className="text-[11px] text-gray-500 font-medium space-y-4">
                            <p>01. Pagamento em segundos, sem complicações</p>
                            <p>02. Basta escanear, com o aplicativo do seu banco, o QRCode que iremos gerar sua compra</p>
                            <p>03. O PIX foi desenvolvido pelo Banco Central para facilitar suas compras e é 100% seguro.</p>
                        </div>
                        <div className="mt-6">
                            <label className="text-[11px] font-bold text-gray-500 mb-1.5 block uppercase">CPF ou CNPJ</label>
                            <input type="tel" name="documento" value={formData.documento} onChange={handleChange} placeholder="CPF ou CNPJ" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                        </div>
                    </div>
                )}
            </div>
          </section>

          {/* Step 3: Order Bumps */}
          <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-[#f4f4f4] px-6 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">COMPRE JUNTO</h2>
            </div>
            <div className="p-6">
                <div className="bg-[#56bc56] text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase w-fit mb-4">APROVEITE!</div>
                <p className="text-[13px] font-medium text-[#444] mb-6">
                    <span className="font-bold text-[#111]">70% das pessoas</span> que compraram Relatório SpyGram Completo também se interessaram por:
                </p>

                <div className="space-y-4">
                    {(Object.keys(bumps) as Array<keyof typeof bumps>).map((key) => (
                        <div key={key} className="p-5 border border-gray-200 rounded-lg flex items-start gap-4">
                            <img src={bumpDetails[key].img} alt="" className="w-16 h-16 object-contain rounded border border-gray-100" />
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-600 uppercase leading-tight mb-1">{bumpDetails[key].title}</p>
                                <p className="text-xs font-black text-green-600 uppercase">✅ À VISTA POR R$ {bumpDetails[key].price.toFixed(2).replace('.', ',')}</p>
                                <p className="text-[11px] font-black text-[#f15c5c] mt-2 italic">{bumpDetails[key].desc}</p>
                            </div>
                            <input type="checkbox" checked={bumps[key]} onChange={() => handleToggleBump(key)} className="w-5 h-5 rounded border-gray-300 text-purple-600 mt-1 cursor-pointer" />
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col items-center">
                    <button onClick={handleFinalize} className="w-full bg-[#56bc56] hover:bg-[#4aa34a] text-white py-4 px-8 rounded-lg font-black text-base uppercase flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]">
                        Finalizar Compra <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-[#56bc56] uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        Pagamento 100% seguro, processado com criptografia 128bits.
                    </div>
                    <p className="mt-4 text-[10px] text-gray-400 font-medium text-center">
                        Produto digital, os dados para acesso serão enviados por email.
                    </p>
                </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <aside className="w-full lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                <div className="bg-[#f4f4f4] px-6 py-3">
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">RESUMO DA COMPRA</h2>
                </div>
                <div className="p-8 flex flex-col items-center">
                    <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-24 mb-6 brightness-0" />
                    
                    <h3 className="text-[13px] font-black text-[#111] uppercase mb-1">Relatório SpyGram Completo</h3>
                    <p className="text-[11px] text-gray-500 font-medium mb-8">Relatório Completo SpyGram® 🕵️ ✅</p>

                    <div className="w-full space-y-3 border-t border-gray-100 pt-6">
                        <div className="flex justify-between text-[11px] font-medium">
                            <span className="text-gray-500">Relatório SpyGram Completo</span>
                            <span className="text-green-600 font-black">R$ {basePrice.toFixed(2).replace('.', ',')}</span>
                        </div>
                        {adicionais > 0 && (
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-gray-500">Adicionais</span>
                                <span className="text-green-600 font-black">+ R$ {adicionais.toFixed(2).replace('.', ',')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-[13px] font-black border-t border-gray-100 pt-3">
                            <span className="text-[#111]">Total Hoje:</span>
                            <span className="text-green-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 border-t border-gray-200 pt-10 px-4 flex flex-col items-center max-w-6xl mx-auto">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase">
                <Mail className="w-4 h-4" />
                E-MAIL DE SUPORTE: contato@spygram.com.br
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">PAGAMENTO PROCESSADO POR:</span>
                <img src="https://perfectpay.com.br/assets/images/logo-black.png" alt="PerfectPay" className="h-4 opacity-70" />
            </div>
            <div className="bg-[#56bc56] text-white py-1.5 px-4 rounded-md text-[10px] font-black uppercase flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> COMPRA 100% SEGURA
            </div>
        </div>

        <div className="text-center space-y-4">
            <p className="text-[10px] text-gray-400 font-medium">
                Esta compra será processada por: PerfectPay © 2026 - Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-gray-400 font-medium italic">
                * * Taxa de 2,99% a.m.
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
                Ao continuar nesta compra, você concorda com os <span className="underline cursor-pointer">Termos de Compra</span> e <span className="underline cursor-pointer">Termos de Privacidade</span>.
            </p>
            <div className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                Ref: PPA22ZU8 | SN: 6A0B849508A08N
            </div>
        </div>

        <div className="mt-10 flex items-center gap-6">
            <img src="https://static.reclameaqui.com.br/selo/ra1000.png" alt="RA1000" className="h-16" />
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;