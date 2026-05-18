"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Consulta a tabela de membros no Supabase
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.trim())
        .eq('password', password.trim())
        .single();

      if (error || !data) {
        toast.error('Acesso negado. Credenciais inválidas ou compra não identificada.');
        return;
      }

      // Se encontrou o registro, realiza o login no contexto
      login('user');
      toast.success('Acesso liberado! Bem-vindo(a).');
      navigate('/servers');
      
    } catch (err) {
      toast.error('Ocorreu um erro ao validar seu acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <div className="bg-[#0f1218]/95 backdrop-blur-2xl border border-gray-800 rounded-[2.5rem] p-10 w-full max-w-[400px] flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        
        <div className="mb-8 flex flex-col items-center">
          <img 
            src="/spygram_transparentebranco.png" 
            alt="SpyGram Logo" 
            className="h-16 drop-shadow-[0_0_10px_rgba(225,48,108,0.3)]" 
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">ACESSO</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-70">
            Área exclusiva para membros
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="E-MAIL DE COMPRA"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#1c222d]/50 text-white px-6 py-4 rounded-2xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-pink-500/30 placeholder-gray-600 text-xs font-black uppercase tracking-widest transition-all"
            />
            <input
              type="password"
              placeholder="CÓDIGO DE ACESSO"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#1c222d]/50 text-white px-6 py-4 rounded-2xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-pink-500/30 placeholder-gray-600 text-xs font-black uppercase tracking-widest transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 mt-4 rounded-2xl font-black text-sm text-white
                       bg-gradient-to-r from-purple-600 to-pink-500
                       shadow-[0_0_25px_rgba(236,72,153,0.3)]
                       hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em]
                       ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'VALIDANDO...' : 'ACESSAR SISTEMA'}
          </button>
        </form>

        <div className="mt-10">
          <div className="flex items-center justify-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-[0.2em] opacity-80">
            <ShieldCheck className="w-4 h-4" />
            <span>SITE SEGURO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPageWithBackground = () => (
  <BackgroundLayout>
    <LoginPage />
  </BackgroundLayout>
);

export default LoginPageWithBackground;