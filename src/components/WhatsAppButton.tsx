import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const WhatsAppButton: React.FC = () => {
  const location = useLocation();
  let isLoggedIn = false;
  
  try {
    const auth = useAuth();
    isLoggedIn = auth.isLoggedIn;
  } catch (error) {
    isLoggedIn = false;
  }

  const hiddenPaths = ['/instagram', '/messages', '/chat'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  const phoneNumber = "5532987182071";
  const message = isLoggedIn 
    ? "Olá, já comprei o acesso SpyGram e estou com dúvidas"
    : "Olá, vim pelo site do SpyGram, estou com dúvidas!";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center">
      {/* Anel de Pulso Luminoso (Glow) */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-16 h-16 bg-[#25D366] rounded-full blur-md"
      />

      {/* Botão Principal do WhatsApp */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] border border-white/20 group cursor-pointer"
        aria-label="Contato via WhatsApp"
      >
        {/* Tooltip moderno */}
        <span className="absolute right-full mr-4 bg-black/90 text-white text-[10px] font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none uppercase tracking-widest border border-white/10 shadow-2xl">
          Suporte Online
        </span>
        
        {/* Vetor Oficial do WhatsApp */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 fill-white drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.057 5.229 5.286.002 11.7.002c3.107.001 6.027 1.212 8.223 3.41 2.197 2.198 3.407 5.119 3.407 8.228 0 6.471-5.229 11.697-11.642 11.697-2.002 0-3.972-.516-5.71-1.499L0 24zm6.54-4.521c1.652.98 3.272 1.498 4.96 1.499 5.347 0 9.7-4.354 9.7-9.699C21.45 6.046 17.1 1.699 11.7 1.699c-5.348 0-9.7 4.346-9.7 9.699 0 1.77.466 3.498 1.348 5.011l-.995 3.637 3.743-.981zm12.39-6.242c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;