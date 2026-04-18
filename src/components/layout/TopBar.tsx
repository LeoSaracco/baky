import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/recetas': 'Recetas',
  '/productos': 'Ingredientes',
  '/packaging': 'Packaging',
  '/costos': 'Análisis de Costos',
  '/presupuestos': 'Presupuestos',
  '/pedidos': 'Pedidos',
  '/supermercados': 'Supermercados',
  '/comparador': 'Comparador de Precios',
  '/lista-compras': 'Lista de Compras',
};

interface TopBarProps {
  sidebarWidth: number;
}

export const TopBar: React.FC<TopBarProps> = ({ sidebarWidth }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Baky';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-6"
      style={{
        left: sidebarWidth,
        height: 'var(--topbar-height)',
        background: 'rgba(10, 10, 10, 0.85)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Date badge */}
        <span className="hidden sm:block text-xs text-[var(--text-muted)] font-mono">
          {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}
        </span>

        {/* Notification dot */}
        <button className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all">
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--pink-500)' }}
          />
        </button>
      </div>
    </header>
  );
};
