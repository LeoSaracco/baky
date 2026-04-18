import React, { useState } from 'react';
import { Plus, Trash2, X, BookOpen } from 'lucide-react';
import { useRecetasStore } from '../../store/useRecetasStore';
import { useProductosStore } from '../../store/useProductosStore';
import { usePackagingStore } from '../../store/usePackagingStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { formatARS, calcCostoReceta } from '../../utils/calcCostos';
import { margenBadge } from '../../utils/badgeHelpers';
import { v4 as uuidv4 } from 'uuid';
import type { CategoriaReceta } from '../../types';
import { RecetaResumen } from './RecetaResumen';

const categorias: { value: CategoriaReceta | ''; label: string }[] = [
  { value: 'tortas', label: 'Tortas' },
  { value: 'galletas', label: 'Galletas' },
  { value: 'panes', label: 'Panes' },
  { value: 'otros', label: 'Otros' },
];

interface RecetaDetailProps {
  recetaId: string | null;
  onDelete: (id: string, nombre: string) => void;
}

export const RecetaDetail: React.FC<RecetaDetailProps> = ({ recetaId, onDelete }) => {
  const { recetas, updateReceta } = useRecetasStore();
  const { productos } = useProductosStore();
  const { packaging: packagingItems } = usePackagingStore();
  const [detailTab, setDetailTab] = useState('materiales');

  const selectedReceta = recetas.find((r) => r.id === recetaId);

  if (!selectedReceta) {
    return (
      <EmptyState
        icon={<BookOpen size={28} />}
        title="Seleccioná una receta"
        description="Hacé clic en una receta para ver y editar sus detalles."
      />
    );
  }

  const costs = calcCostoReceta(selectedReceta, productos);

  // Helper functions for items
  const updateIngrediente = (id: string, field: string, value: string) => {
    updateReceta(selectedReceta.id, {
      ingredientes: selectedReceta.ingredientes.map((ing) =>
        ing.id === id ? { ...ing, [field]: field === 'cantidad' ? Number(value) : value } : ing
      ),
    });
  };

  const removeIngrediente = (id: string) => {
    updateReceta(selectedReceta.id, {
      ingredientes: selectedReceta.ingredientes.filter((ing) => ing.id !== id),
    });
  };

  const addIngrediente = () => {
    updateReceta(selectedReceta.id, {
      ingredientes: [...selectedReceta.ingredientes, { id: uuidv4(), productoId: '', cantidad: 0 }],
    });
  };

  const updateMoO = (id: string, field: string, value: string) => {
    updateReceta(selectedReceta.id, {
      manoDeObra: selectedReceta.manoDeObra.map((m) =>
        m.id === id ? { ...m, [field]: field === 'minutos' || field === 'tarifaHora' ? Number(value) : value } : m
      ),
    });
  };

  const removeMoO = (id: string) => {
    updateReceta(selectedReceta.id, {
      manoDeObra: selectedReceta.manoDeObra.filter((m) => m.id !== id),
    });
  };

  const addMoO = () => {
    updateReceta(selectedReceta.id, {
      manoDeObra: [...selectedReceta.manoDeObra, { id: uuidv4(), actividad: '', tarifaHora: 3000, minutos: 0 }],
    });
  };

  const updatePackaging = (id: string, field: string, value: string | number) => {
    updateReceta(selectedReceta.id, {
      packaging: selectedReceta.packaging.map((p) =>
        p.id === id ? { ...p, [field]: field === 'cantidad' || field === 'costoUnitario' ? Number(value) : value } : p
      ),
    });
  };

  const removePackaging = (id: string) => {
    updateReceta(selectedReceta.id, {
      packaging: selectedReceta.packaging.filter((p) => p.id !== id),
    });
  };

  const addPackagingRow = () => {
    updateReceta(selectedReceta.id, {
      packaging: [...selectedReceta.packaging, { id: uuidv4(), nombre: '', costoUnitario: 0, cantidad: 1 }],
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-2">
        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent border-none text-2xl font-bold w-full p-0 focus:ring-0 text-[var(--text-primary)] mb-1"
            placeholder="Nombre de la receta..."
            value={selectedReceta.nombre}
            onChange={(e) => updateReceta(selectedReceta.id, { nombre: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <select
              className="bg-[var(--bg-base)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 focus:ring-1 ring-[var(--pink-400)] transition-all"
              value={selectedReceta.categoria}
              onChange={(e) => updateReceta(selectedReceta.id, { categoria: e.target.value as CategoriaReceta })}
            >
              {categorias.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] border border-[var(--border-subtle)] px-2 py-1 rounded-lg">
              {selectedReceta.sku}
            </span>
            <Badge variant={margenBadge(costs.margenReal)} size="sm">
              {costs.margenReal.toFixed(0)}% Rentabilidad
            </Badge>
          </div>
        </div>
        <button
          onClick={() => onDelete(selectedReceta.id, selectedReceta.nombre)}
          className="p-3 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 border border-transparent hover:border-red-500/20"
          title="Eliminar receta"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'materiales', label: 'Materiales' },
          { id: 'moo', label: 'M. de Obra' },
          { id: 'packaging', label: 'Packaging' },
          { id: 'resumen', label: 'Resumen' },
        ]}
        activeTab={detailTab}
        onChange={setDetailTab}
      />

      {/* Tab content */}
      {detailTab === 'materiales' && (
        <div className="space-y-3">
          <div className="overflow-x-auto text-left">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-overlay)' }}>
                  <th className="text-left p-2 text-xs text-[var(--text-muted)] font-medium">Ingrediente</th>
                  <th className="text-left p-2 text-xs text-[var(--text-muted)] font-medium">Unidad</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Precio/u</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Cantidad</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Subtotal</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedReceta.ingredientes.map((ing) => {
                  const prod = productos.find((p) => p.id === ing.productoId);
                  const subtotal = prod ? prod.precioActual * ing.cantidad : 0;
                  return (
                    <tr key={ing.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td className="p-2">
                        <select
                          className="input-field py-1.5 text-sm"
                          value={ing.productoId}
                          onChange={(e) => updateIngrediente(ing.id, 'productoId', e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-[var(--text-muted)] text-xs">{prod?.unidad ?? '-'}</td>
                      <td className="p-2 text-right text-[var(--text-muted)] text-xs mono">
                        {prod ? formatARS(prod.precioActual) : '-'}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="input-field py-1.5 text-right text-sm w-20"
                          value={ing.cantidad}
                          onChange={(e) => updateIngrediente(ing.id, 'cantidad', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right font-medium mono text-[var(--pink-400)]">
                        {formatARS(subtotal)}
                      </td>
                      <td className="p-2">
                        <button onClick={() => removeIngrediente(ing.id)} className="text-[var(--text-muted)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addIngrediente}>
            Agregar ingrediente
          </Button>
        </div>
      )}

      {detailTab === 'moo' && (
        <div className="space-y-3">
          <div className="overflow-x-auto text-left">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-overlay)' }}>
                  <th className="text-left p-2 text-xs text-[var(--text-muted)] font-medium">Actividad</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Tarifa/h</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Minutos</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Subtotal</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedReceta.manoDeObra.map((m) => {
                  const subtotal = (m.tarifaHora / 60) * m.minutos;
                  return (
                    <tr key={m.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td className="p-2">
                        <input
                          className="input-field py-1.5 text-sm"
                          value={m.actividad}
                          placeholder="Actividad..."
                          onChange={(e) => updateMoO(m.id, 'actividad', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="input-field py-1.5 text-right text-sm w-24"
                          value={m.tarifaHora}
                          onChange={(e) => updateMoO(m.id, 'tarifaHora', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="input-field py-1.5 text-right text-sm w-20"
                          value={m.minutos}
                          onChange={(e) => updateMoO(m.id, 'minutos', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-right font-medium mono text-[var(--pink-400)]">
                        {formatARS(subtotal)}
                      </td>
                      <td className="p-2">
                        <button onClick={() => removeMoO(m.id)} className="text-[var(--text-muted)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addMoO}>
            Agregar tarea
          </Button>
        </div>
      )}

      {detailTab === 'packaging' && (
        <div className="space-y-3">
          <div className="overflow-x-auto text-left">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-overlay)' }}>
                  <th className="text-left p-2 text-xs text-[var(--text-muted)] font-medium">Ítem</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Costo/u</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Cantidad</th>
                  <th className="text-right p-2 text-xs text-[var(--text-muted)] font-medium">Subtotal</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedReceta.packaging.map((pk) => {
                  const subtotal = pk.costoUnitario * pk.cantidad;
                  return (
                    <tr key={pk.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td className="p-2">
                        <select
                          className="input-field py-1.5 text-sm"
                          value={pk.packagingId ?? ''}
                          onChange={(e) => {
                            const found = packagingItems.find((i) => i.id === e.target.value);
                            if (found) {
                              updatePackaging(pk.id, 'packagingId', found.id);
                              updatePackaging(pk.id, 'nombre', found.nombre);
                              updatePackaging(pk.id, 'costoUnitario', found.costoUnitario);
                            }
                          }}
                        >
                          <option value="">Personalizado...</option>
                          {packagingItems.map((i) => (
                            <option key={i.id} value={i.id}>{i.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="input-field py-1.5 text-right text-sm w-24"
                          value={pk.costoUnitario}
                          onChange={(e) => updatePackaging(pk.id, 'costoUnitario', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="input-field py-1.5 text-right text-sm w-20"
                          value={pk.cantidad}
                          onChange={(e) => updatePackaging(pk.id, 'cantidad', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2 text-right font-medium mono text-[var(--pink-400)]">
                        {formatARS(subtotal)}
                      </td>
                      <td className="p-2">
                        <button onClick={() => removePackaging(pk.id)} className="text-[var(--text-muted)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addPackagingRow}>
            Agregar packaging
          </Button>
        </div>
      )}

      {detailTab === 'resumen' && (
        <RecetaResumen
          receta={selectedReceta}
          productos={productos}
          margen={selectedReceta.margenGanancia}
          setMargen={(v) => updateReceta(selectedReceta.id, { margenGanancia: v })}
          descuento={selectedReceta.descuento}
          setDescuento={(v) => updateReceta(selectedReceta.id, { descuento: v })}
          impuestos={selectedReceta.impuestos}
          setImpuestos={(v) => updateReceta(selectedReceta.id, { impuestos: v })}
        />
      )}
    </div>
  );
};
