import React from 'react';
import { ShoppingCart, Trash2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useRecetasStore } from '../../store/useRecetasStore';
import { Badge, estadoPedidoBadge, estadoPedidoLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatARS } from '../../utils/calcCostos';
import toast from 'react-hot-toast';
import type { EstadoPedido } from '../../types';

const estadosFlow: EstadoPedido[] = ['pendiente', 'en_preparacion', 'listo', 'entregado'];

interface PedidoDetailProps {
  pedidoId: string | null;
  onDelete: (id: string) => void;
  onNewClick: () => void;
  onCloseMobile?: () => void;
}

export const PedidoDetail: React.FC<PedidoDetailProps> = ({
  pedidoId,
  onDelete,
  onNewClick,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { pedidos, updateEstado } = usePedidosStore();
  const { recetas } = useRecetasStore();

  const selected = pedidos.find((p) => p.id === pedidoId) ?? null;

  if (!selected) {
    return (
      <EmptyState
        icon={<ShoppingCart size={28} />}
        title="Seleccioná un pedido"
        description="Hacé clic en un pedido para ver sus detalles."
        action={<Button icon={<Plus size={16} />} onClick={onNewClick}>Nuevo pedido</Button>}
      />
    );
  }

  const total = selected.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  const currentIdx = estadosFlow.indexOf(selected.estado);
  const canAdvance = currentIdx < estadosFlow.length - 1;

  const handleEstadoNext = () => {
    if (canAdvance) {
      const nextEstado = estadosFlow[currentIdx + 1];
      updateEstado(selected.id, nextEstado);
      toast.success(`Pedido marcado como: ${estadoPedidoLabel(nextEstado)}`);
    }
  };

  return (
    <div className="space-y-5 text-left">
      {onCloseMobile && (
        <button className="flex items-center gap-2 text-sm text-[var(--pink-400)] mb-4" onClick={onCloseMobile}>
          ← Volver a pedidos
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold mono text-[var(--pink-500)] text-lg">{selected.numero}</span>
            <Badge variant={estadoPedidoBadge(selected.estado)}>{estadoPedidoLabel(selected.estado)}</Badge>
          </div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{selected.cliente}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Entrega: {new Date(selected.fechaEntrega).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => onDelete(selected.id)}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all font-bold"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Status flow */}
      <div className="flex items-center gap-1 py-4">
        {estadosFlow.map((e, i) => {
          const isCurrentOrPast = i <= currentIdx;
          return (
            <React.Fragment key={e}>
              <div className={`flex-1 flex flex-col items-center gap-1`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isCurrentOrPast ? 'var(--gradient-brand)' : 'var(--bg-overlay)',
                    color: isCurrentOrPast ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${isCurrentOrPast ? 'transparent' : 'var(--border-subtle)'}`,
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-[10px] text-center leading-tight" style={{ color: isCurrentOrPast ? 'var(--pink-400)' : 'var(--text-muted)' }}>
                  {estadoPedidoLabel(e)}
                </span>
              </div>
              {i < estadosFlow.length - 1 && (
                <div
                  className="h-0.5 flex-1 mb-4"
                  style={{ background: i < currentIdx ? 'var(--gradient-brand)' : 'var(--border-subtle)' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Items */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--bg-overlay)' }}>
              <th className="p-2 text-left text-xs font-bold text-[var(--text-muted)] uppercase">Receta</th>
              <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Cant.</th>
              <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Precio unit.</th>
              <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {selected.items.map((item) => {
              const receta = recetas.find((r) => r.id === item.recetaId);
              return (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="p-2 font-medium">{receta?.nombre ?? 'Receta eliminada'}</td>
                  <td className="p-2 text-right mono">{item.cantidad}</td>
                  <td className="p-2 text-right mono">{formatARS(item.precioUnitario)}</td>
                  <td className="p-2 text-right mono font-semibold" style={{ color: 'var(--pink-500)' }}>
                    {formatARS(item.cantidad * item.precioUnitario)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div
          className="px-5 py-3 rounded-xl"
          style={{ background: 'var(--pink-glow)', border: '1px solid var(--border-active)' }}
        >
          <span className="text-sm text-[var(--text-secondary)]">Total: </span>
          <span className="text-xl font-bold mono" style={{ color: 'var(--pink-500)' }}>
            {formatARS(total)}
          </span>
        </div>
      </div>

      {selected.notas && (
        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-xs text-[var(--text-muted)] mb-1">Notas</p>
          <p className="text-[var(--text-secondary)]">{selected.notas}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap sticky bottom-0 bg-[var(--bg-elevated)] py-4 justify-end border-t border-[var(--border-subtle)] z-10">
        {canAdvance && (
          <Button
            icon={<ChevronRight size={15} />}
            onClick={handleEstadoNext}
          >
            Avanzar estado
          </Button>
        )}
        <Button
          variant="secondary"
          icon={<ShoppingCart size={15} />}
          onClick={() => navigate('/lista-compras')}
        >
          Generar lista de compras
        </Button>
      </div>
    </div>
  );
};

// Helper for icon
const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
