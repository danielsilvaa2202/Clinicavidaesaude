// src/components/layout/logo.tsx

import { useSidebar } from '@/components/ui/sidebar'

export const Logo = () => {
    const { state } = useSidebar();
  
    return (
      <div className="flex items-center justify-center h-full">
        {state === 'expanded' ? (
          <img
            src="/images/header.png" // Caminho da sua logo completa
            alt="Logo Completo"
            className="h-16 w-auto transition-opacity duration-200" // Aumente o tamanho aqui
          />
        ) : (
          <img
            src="/images/icon.png" // Caminho do ícone da logo
            alt="Ícone do Logo"
            className="h-8 w-auto transition-opacity duration-200"
          />
        )}
      </div>
    );
  };
