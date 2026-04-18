import React from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  mobileLabel?: boolean; // show as label in mobile card
  mobilePrimary?: boolean; // bold title in mobile card
  mobileHide?: boolean; // hidden in mobile card
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedId?: string;
  actions?: (row: T) => React.ReactNode;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos',
  onRowClick,
  selectedId,
  actions,
}: TableProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-16 text-[var(--text-muted)] text-sm"
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  // Mobile: render as cards
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const key = keyExtractor(row);
          const primaryCol = columns.find((c) => c.mobilePrimary);
          const visibleCols = columns.filter((c) => !c.mobileHide && !c.mobilePrimary);
          return (
            <div
              key={key}
              className="card p-4 cursor-pointer"
              style={
                selectedId === key
                  ? { borderColor: 'var(--border-active)', borderLeft: '3px solid var(--pink-500)' }
                  : {}
              }
              onClick={() => onRowClick?.(row)}
            >
              {primaryCol && (
                <div className="font-semibold text-[var(--text-primary)] mb-2">
                  {primaryCol.render ? primaryCol.render(row) : String(row[primaryCol.key] ?? '')}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {visibleCols.map((col) => (
                  <div key={col.key}>
                    <span className="text-xs text-[var(--text-muted)]">{col.header}</span>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                    </div>
                  </div>
                ))}
              </div>
              {actions && (
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {actions(row)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: standard table
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
            {actions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = keyExtractor(row);
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                style={
                  selectedId === key
                    ? { borderLeft: '3px solid var(--pink-500)', background: 'var(--bg-overlay)' }
                    : {}
                }
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                  </td>
                ))}
                {actions && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">{actions(row)}</div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
