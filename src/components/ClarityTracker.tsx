"use client";

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ClarityTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Verifica se o script do Clarity está carregado globalmente no navegador
    if (typeof window !== 'undefined' && (window as any).clarity) {
      const currentPath = location.pathname;
      
      // Envia uma tag personalizada para o Clarity identificando a rota atual
      (window as any).clarity("set", "route", currentPath);
      
      // Também pode disparar um evento customizado para facilitar filtros no dashboard
      (window as any).clarity("event", `page_view_${currentPath.replace(/\//g, '_')}`);
    }
  }, [location]);

  return null;
};

export default ClarityTracker;