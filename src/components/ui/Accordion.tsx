import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpen = [],
  className = '',
}) => {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => toggle(item.id)}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-[var(--pink-400)]">{item.icon}</span>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-[var(--text-muted)]">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-[var(--text-muted)] transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {isOpen && (
              <div
                className="px-4 pb-4 animate-fade-in"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <div className="pt-3">{item.children}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
