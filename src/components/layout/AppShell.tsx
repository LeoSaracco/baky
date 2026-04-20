import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import {
  Package, Box, FileText, MapPin, BarChart2, ShoppingCart, X,
} from 'lucide-react';

const moreItems = [
  { path: '/productos', label: 'Ingredientes', icon: <Package size={18} /> },
  { path: '/packaging', label: 'Packaging', icon: <Box size={18} /> },
  { path: '/presupuestos', label: 'Presupuestos', icon: <FileText size={18} /> },
  { path: '/supermercados', label: 'Supermercados', icon: <MapPin size={18} /> },
  { path: '/comparador', label: 'Comparador', icon: <BarChart2 size={18} /> },
  { path: '/lista-compras', label: 'Lista de Compras', icon: <ShoppingCart size={18} /> },
];

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isTablet);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const sidebarWidth = isMobile
    ? 0
    : sidebarCollapsed
    ? 60
    : 220;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Sidebar — desktop/tablet only */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      )}

      {/* TopBar */}
      <TopBar sidebarWidth={sidebarWidth} />

      {/* Main content */}
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: 'var(--topbar-height)',
          paddingBottom: isMobile ? 'calc(var(--bottomnav-height) + env(safe-area-inset-bottom))' : 0,
          minHeight: '100vh',
        }}
      >
        <div className="p-4 md:p-6 animate-fade-in">{children}</div>
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav onMoreClick={() => setMoreSheetOpen(true)} />}

      {/* More bottom sheet - inline */}
      {moreSheetOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMoreSheetOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-base)] rounded-t-2xl p-4 z-50 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Más módulos</h3>
              <button 
                onClick={() => setMoreSheetOpen(false)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreSheetOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[var(--pink-glow)] border border-[var(--border-active)] text-[var(--pink-400)]'
                        : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
