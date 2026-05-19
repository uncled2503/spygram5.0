import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WhatsAppButton: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const phoneNumber = "5532987182071";
  
  // Define a mensagem com base no status de login (que representa a compra no fluxo do app)
  const message = isLoggedIn 
    ? "Olá, já comprei o acesso SpyGram e estou com dúvidas"
    : "Olá, vim pelo site do SpyGram, estou com dúvidas!";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center group"
      aria-label="Contato via WhatsApp"
    >
      {/* Tooltip discreto no hover */}
      <span className="absolute right-full mr-3 bg-black/80 text-white text-[10px] font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest border border-white/10">
        Suporte Online
      </span>
      <MessageCircle size={28} fill="currentColor" className="text-white" />
    </a>
  );
};

export default WhatsAppButton;