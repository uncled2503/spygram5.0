import React from 'react';
import { motion } from 'framer-motion';
import { Coins, User } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="flex justify-between items-center mb-16 w-full">
      {/* Lado Esquerdo: Logo e Nome */}
      <div className="flex items-center gap-4">
        <motion.div 
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          className="relative group"
        >
          {/* Efeito de brilho atrás do logo */}
          <div className="absolute -inset-2 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
            <img src="/spygram_transparentebranco.png" alt="SpyGram" className="h-7 w-auto object-contain" />
          </div>
        </motion.div>
        
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
            Spy<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gram</span>
          </h1>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Intelligence</span>
        </div>
      </div>
      
      {/* Lado Direito: Status do Operador */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl"
      >
        {/* Seção de Créditos */}
        <div className="flex flex-col items-end px-4 py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Créditos</span>
            <Coins className="w-2.5 h-2.5 text-yellow-500" />
          </div>
          <span className="text-sm font-black text-white tabular-nums">0</span>
        </div>

        {/* Divisor */}
        <div className="w-px h-8 bg-white/10 mx-1"></div>

        {/* Seção do Perfil */}
        <div className="flex items-center gap-3 pl-2 pr-4 py-1 cursor-pointer hover:bg-white/5 rounded-full transition-colors">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full animate-pulse opacity-50"></div>
            <div className="relative w-9 h-9 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
              <img src="/perfil.jpg" alt="User" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all" />
              <div className="absolute inset-0 bg-purple-500/10"></div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-black text-white tracking-tight">@user-403</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Operador</span>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default AppHeader;