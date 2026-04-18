import React from 'react';
import { Plus, Copy, Send, Download, Trash2, X, FileText } from 'lucide-react';
import { usePresupuestosStore } from '../../store/usePresupuestosStore';
import { useRecetasStore } from '../../store/useRecetasStore';
import { useProductosStore } from '../../store/useProductosStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { estadoPresupuestoBadge, estadoPresupuestoLabel } from '../ui/BadgeHelpers';
import { EmptyState } from '../ui/EmptyState';
import { calcCostoReceta, formatARS } from '../../utils/calcCostos';
import { exportPresupuestoPDF } from '../../utils/exportPDF';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import type { EstadoPresupuesto, ItemPresupuesto } from '../../types';

interface PresupuestoDetailProps {
  presupuestoId: string | null;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  handleNew: () => void;
}

export const PresupuestoDetail: React.FC<PresupuestoDetailProps> = ({
  presupuestoId,
  onDelete,
  onDuplicate,
  handleNew,
}) => {
  const { presupuestos, updatePresupuesto, updateEstado } = usePresupuestosStore();
  const { recetas } = useRecetasStore();
  const { productos } = useProductosStore();

  const selected = presupuestos.find((p) => p.id === presupuestoId) ?? null;

  const addItem = () => {
    if (!selected) return;
    const item: ItemPresupuesto = { id: uuidv4(), recetaId: '', cantidad: 1, precioUnitario: 0 };
    updatePresupuesto(selected.id, { items: [...selected.items, item] });
  };

  const updateItem = (itemId: string, field: keyof ItemPresupuesto, value: string | number) => {
    if (!selected) return;
    updatePresupuesto(selected.id, {
      items: selected.items.map((i) => {
        if (i.id !== itemId) return i;
        if (field === 'recetaId') {
          const receta = recetas.find((r) => r.id === value);
          const precio = receta ? calcCostoReceta(receta, productos).precioVenta : 0;
          return { ...i, recetaId: value as string, precioUnitario: precio };
        }
        return { ...i, [field]: Number(value) };
      }),
    });
  };

  const removeItem = (itemId: string) => {
    if (!selected) return;
    updatePresupuesto(selected.id, { items: selected.items.filter((i) => i.id !== itemId) });
  };

  const calculateTotals = () => {
    if (!selected) return { subtotal: 0, descuento: 0, impuestos: 0, total: 0 };
    const subtotal = selected.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
    const descuento = subtotal * (selected.descuento / 100);
    const impuestos = (subtotal - descuento) * (selected.impuestos / 100);
    return { subtotal, descuento, impuestos, total: subtotal - descuento + impuestos };
  };

  const totals = calculateTotals();

  const calculateMargin = () => {
    if (!selected) return { costoTotal: 0, ganancia: 0 };
    let costoTotal = 0;
    for (const item of selected.items) {
      const receta = recetas.find((r) => r.id === item.recetaId);
      if (receta) {
        costoTotal += calcCostoReceta(receta, productos).costoTotal * item.cantidad;
      }
    }
    return { costoTotal, ganancia: totals.total - costoTotal };
  };

  const marginAnalysis = calculateMargin();

  if (!selected) {
    return (
      <EmptyState
        icon={<FileText size={28} />}
        title="Seleccioná un presupuesto"
        description="Hacé clic en un presupuesto para verlo o creá uno nuevo."
        action={<Button icon={<Plus size={16} />} onClick={handleNew}>Nuevo presupuesto</Button>}
      />
    );
  }

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold mono text-[var(--pink-500)]">{selected.numero}</span>
            <Badge variant={estadoPresupuestoBadge(selected.estado)}>
              {estadoPresupuestoLabel(selected.estado)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicate(selected.id)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--pink-400)] hover:bg-[var(--pink-glow)] transition-all"
            title="Duplicar"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => {
              exportPresupuestoPDF(selected, recetas);
              toast.success('PDF exportado');
            }}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--pink-400)] hover:bg-[var(--pink-glow)] transition-all"
            title="Exportar PDF"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => onDelete(selected.id)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Cliente</label>
          <input
            className="input-field"
            value={selected.cliente}
            onChange={(e) => updatePresupuesto(selected.id, { cliente: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Estado</label>
          <select
            className="input-field"
            value={selected.estado}
            onChange={(e) => updateEstado(selected.id, e.target.value as EstadoPresupuesto)}
          >
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aceptado">Aceptado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Fecha emisión</label>
          <input
            type="date"
            className="input-field"
            value={selected.fechaEmision.split('T')[0]}
            onChange={(e) => updatePresupuesto(selected.id, { fechaEmision: new Date(e.target.value).toISOString() })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)]">Fecha vencimiento</label>
          <input
            type="date"
            className="input-field"
            value={selected.fechaVencimiento.split('T')[0]}
            onChange={(e) => updatePresupuesto(selected.id, { fechaVencimiento: new Date(e.target.value).toISOString() })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--text-muted)]">Notas</label>
        <textarea
          className="input-field resize-none"
          rows={2}
          value={selected.notas ?? ''}
          onChange={(e) => updatePresupuesto(selected.id, { notas: e.target.value })}
          placeholder="Detalles adicionales del presupuesto..."
        />
      </div>

      {/* Items table */}
      <div>
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-overlay)' }}>
                <th className="p-2 text-left text-xs font-bold text-[var(--text-muted)] uppercase">Receta</th>
                <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Cantidad</th>
                <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Precio unit.</th>
                <th className="p-2 text-right text-xs font-bold text-[var(--text-muted)] uppercase">Subtotal</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="p-2">
                    <select
                      className="input-field py-1.5 text-sm"
                      value={item.recetaId}
                      onChange={(e) => updateItem(item.id, 'recetaId', e.target.value)}
                    >
                      <option value="">Seleccionar receta...</option>
                      {recetas.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="input-field py-1.5 w-20 text-right"
                      value={item.cantidad}
                      onChange={(e) => updateItem(item.id, 'cantidad', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="input-field py-1.5 w-32 text-right mono"
                      value={item.precioUnitario}
                      onChange={(e) => updateItem(item.id, 'precioUnitario', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-right mono font-semibold" style={{ color: 'var(--pink-500)' }}>
                    {formatARS(item.cantidad * item.precioUnitario)}
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(item.id)} className="text-[var(--text-muted)] hover:text-red-400">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addItem} className="mt-2">
          Agregar ítem
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 space-y-3 bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Desglose de Totales</h4>
          <div className="flex justify-between items-center text-sm text-[var(--text-secondary)]">
            <span>Subtotal ítems</span>
            <span className="mono">{formatARS(totals.subtotal)}</span>
          </div>
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Descuento</span>
              <input
                type="number"
                className="input-field py-1 w-16 text-right text-xs"
                placeholder="0"
                value={selected.descuento === 0 ? '' : selected.descuento}
                onChange={(e) => updatePresupuesto(selected.id, { descuento: Number(e.target.value) })}
              />
              <span className="text-[var(--text-muted)] text-xs">%</span>
            </div>
            <span className="mono text-red-400">-{formatARS(totals.descuento)}</span>
          </div>
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Recargo/Imp.</span>
              <input
                type="number"
                className="input-field py-1 w-16 text-right text-xs"
                placeholder="0"
                value={selected.impuestos === 0 ? '' : selected.impuestos}
                onChange={(e) => updatePresupuesto(selected.id, { impuestos: Number(e.target.value) })}
              />
              <span className="text-[var(--text-muted)] text-xs">%</span>
            </div>
            <span className="mono">{formatARS(totals.impuestos)}</span>
          </div>
          <div
            className="flex justify-between pt-4 items-center border-t border-[var(--border-active)]"
          >
            <span className="font-bold text-[var(--text-primary)]">TOTAL</span>
            <span className="text-2xl font-black mono text-[var(--pink-500)]">
              {formatARS(totals.total)}
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] italic mt-2">
            * Nota: Los precios ya incluyen impuestos y márgenes configurados en cada receta.
          </p>
        </div>

        {/* Margin analysis */}
        <div className="rounded-2xl p-6 bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Análisis de Rentabilidad</h4>
          <div className="space-y-4">
             <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-muted)]">Costo Real (Materiales + MO + Pack)</span>
                  <span className="mono text-[var(--text-secondary)]">{formatARS(marginAnalysis.costoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Tu Ganancia Neta</span>
                  <span className={`mono font-bold ${marginAnalysis.ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatARS(marginAnalysis.ganancia)}
                  </span>
                </div>
             </div>
             
             <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Margen del Trabajo</span>
                  <Badge variant={marginAnalysis.ganancia / totals.total >= 0.25 ? 'mint' : 'pink'}>
                    {totals.total > 0 ? ((marginAnalysis.ganancia / totals.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-[var(--pink-500)] transition-all" 
                    style={{ width: `${Math.min(100, Math.max(0, (marginAnalysis.ganancia / totals.total) * 100))}%` }}
                  />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap sticky bottom-0 bg-[var(--bg-elevated)] py-4 justify-end border-t border-[var(--border-subtle)] z-10">
        <Button
          variant="secondary"
          icon={<Send size={15} />}
          onClick={() => { updateEstado(selected.id, 'enviado'); toast.success('Marcado como enviado'); }}
        >
          Marcar enviado
        </Button>
        <Button
          icon={<Download size={15} />}
          onClick={() => { exportPresupuestoPDF(selected, recetas); toast.success('PDF generado'); }}
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
