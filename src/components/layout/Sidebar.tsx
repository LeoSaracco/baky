import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Package,
  DollarSign,
  FileText,
  MapPin,
  BarChart2,
  ShoppingCart,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Box,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/recetas', label: 'Recetas', icon: <BookOpen size={18} /> },
  { path: '/productos', label: 'Ingredientes', icon: <Package size={18} /> },
  { path: '/packaging', label: 'Packaging', icon: <Box size={18} /> },
  { path: '/costos', label: 'Costos', icon: <DollarSign size={18} /> },
  { path: '/presupuestos', label: 'Presupuestos', icon: <FileText size={18} /> },
  { path: '/pedidos', label: 'Pedidos', icon: <ClipboardList size={18} /> },
  { path: '/supermercados', label: 'Supermercados', icon: <MapPin size={18} /> },
  { path: '/comparador', label: 'Comparador', icon: <BarChart2 size={18} /> },
  { path: '/lista-compras', label: 'Lista de Compras', icon: <ShoppingCart size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 flex-shrink-0"
        style={{
          height: 'var(--topbar-height)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {collapsed ? (
          <div className="w-full flex justify-center">
            <span
              className="text-xl font-light tracking-widest"
              style={{ color: 'var(--pink-500)', fontFamily: 'Sora, sans-serif', letterSpacing: '0.08em' }}
            >
              B
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
              <text
                x="0"
                y="22"
                fontFamily="Sora, sans-serif"
                fontSize="22"
                fontWeight="300"
                fill="#F472B6"
                letterSpacing="3"
              >
                Baky
              </text>
              {/* Sakura petals */}
              <circle cx="72" cy="6" r="3" fill="#F472B6" opacity="0.7" />
              <circle cx="78" cy="10" r="2" fill="#C084FC" opacity="0.5" />
              <circle cx="75" cy="3" r="1.5" fill="#F9A8D4" opacity="0.4" />
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-xl transition-all duration-150 group relative ${
                isActive
                  ? 'text-[var(--pink-400)] bg-[var(--pink-glow)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { border: '1px solid var(--border-subtle)' }
                : { border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-[var(--pink-400)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {collapsed && (
                  <div
                    className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                    style={{
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs">Colapsar</span>}
        </button>
      </div>
    </aside>
  );
};
