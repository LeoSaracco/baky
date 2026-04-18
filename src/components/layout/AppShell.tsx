import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { BottomSheet } from '../ui/BottomSheet';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import {
  Package, Box, FileText, MapPin, BarChart2, ShoppingCart,
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

      {/* More bottom sheet */}
      <BottomSheet
        open={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        title="Más módulos"
      >
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
      </BottomSheet>
    </div>
  );
};
