import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  ClipboardList,
  MoreHorizontal,
} from 'lucide-react';

interface BottomNavProps {
  onMoreClick: () => void;
}

const mainItems = [
  { path: '/', label: 'Inicio', icon: <LayoutDashboard size={22} /> },
  { path: '/recetas', label: 'Recetas', icon: <BookOpen size={22} /> },
  { path: '/costos', label: 'Costos', icon: <DollarSign size={22} /> },
  { path: '/pedidos', label: 'Pedidos', icon: <ClipboardList size={22} /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({ onMoreClick }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        height: 'var(--bottomnav-height)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {mainItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px]"
        >
          {({ isActive }) => (
            <>
              <span
                className="transition-all duration-150"
                style={{ color: isActive ? 'var(--pink-400)' : 'var(--text-muted)' }}
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] font-medium transition-all"
                style={{ color: isActive ? 'var(--pink-400)' : 'var(--text-muted)' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 h-0.5 w-8 rounded-full"
                  style={{ background: 'var(--gradient-brand)' }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* More button */}
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] text-[var(--text-muted)]"
      >
        <MoreHorizontal size={22} />
        <span className="text-[10px] font-medium">Más</span>
      </button>
    </nav>
  );
};
