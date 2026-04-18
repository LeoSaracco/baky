import React, { useState, useMemo } from 'react';
import { Plus, Save, BarChart2, X, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { usePreciosStore } from '../store/usePreciosStore';
import { useSupermercadosStore } from '../store/useSupermercadosStore';
import { useProductosStore } from '../store/useProductosStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { formatARS } from '../utils/calcCostos';

interface CargaRow {
  id: string;
  productoId: string;
  precio: string;
}

export const ComparadorPrecios: React.FC = () => {
  const { precios, addPrecios } = usePreciosStore();
  const { supermercados } = useSupermercadosStore();
  const { productos } = useProductosStore();

  const [tab, setTab] = useState('cargar');
  const [superId, setSuperId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<CargaRow[]>([{ id: uuidv4(), productoId: '', precio: '' }]);
  const [busqueda, setBusqueda] = useState('');

  const addRow = () => setRows((r) => [...r, { id: uuidv4(), productoId: '', precio: '' }]);
  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));
  const updateRow = (id: string, field: keyof CargaRow, value: string) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const handleSave = () => {
    if (!superId) { toast.error('Seleccioná un supermercado'); return; }
    const valid = rows.filter((r) => r.productoId && r.precio && Number(r.precio) > 0);
    if (!valid.length) { toast.error('Agregá al menos un precio válido'); return; }
    addPrecios(
      valid.map((r) => ({
        productoId: r.productoId,
        supermercadoId: superId,
        precio: Number(r.precio),
        fecha: new Date(fecha).toISOString(),
      }))
    );
    toast.success(`${valid.length} precio${valid.length > 1 ? 's' : ''} guardado${valid.length > 1 ? 's' : ''}`);
    setRows([{ id: uuidv4(), productoId: '', precio: '' }]);
  };

  // Comparativa: latest price per product per super
  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  }, [productos, busqueda]);

  const comparativaProducto = useMemo(() => {
    const pid = productosFiltrados[0]?.id;
    if (!pid) return [];
    const bySuper: Record<string, number[]> = {};
    precios.filter((p) => p.productoId === pid).forEach((p) => {
      if (!bySuper[p.supermercadoId]) bySuper[p.supermercadoId] = [];
      bySuper[p.supermercadoId].push(p.precio);
    });
    return Object.entries(bySuper)
      .map(([sId, prices]) => ({
        superId: sId,
        nombre: supermercados.find((s) => s.id === sId)?.nombre ?? sId,
        precio: Math.min(...prices),
        fecha: precios
          .filter((p) => p.productoId === pid && p.supermercadoId === sId)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]?.fecha ?? '',
      }))
      .sort((a, b) => a.precio - b.precio);
  }, [productosFiltrados, precios, supermercados]);

  const minPrecio = comparativaProducto[0]?.precio ?? 0;

  // Insight
  const insight = useMemo(() => {
    if (supermercados.length === 0 || precios.length === 0) return null;
    const bySuper: Record<string, number> = {};
    precios.forEach((p) => {
      bySuper[p.supermercadoId] = (bySuper[p.supermercadoId] ?? 0) + p.precio;
    });
    const sorted = Object.entries(bySuper).sort((a, b) => a[1] - b[1]);
    const cheapestId = sorted[0]?.[0];
    const cheapestName = supermercados.find((s) => s.id === cheapestId)?.nombre ?? '';
    const saving = sorted.length > 1 ? sorted[sorted.length - 1][1] - sorted[0][1] : 0;
    return { nombre: cheapestName, ahorro: saving };
  }, [precios, supermercados]);

  return (
    <div className="space-y-5">
      <Tabs
        tabs={[
          { id: 'cargar', label: 'Cargar precios' },
          { id: 'comparar', label: 'Comparativa' },
        ]}
        activeTab={tab}
        onChange={setTab}
        className="max-w-sm"
      />

      {tab === 'cargar' && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs text-[var(--text-muted)]">Supermercado</label>
              <select className="input-field" value={superId} onChange={(e) => setSuperId(e.target.value)}>
                <option value="">Seleccioná un supermercado...</option>
                {supermercados.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--text-muted)]">Fecha</label>
              <input
                type="date"
                className="input-field"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          {/* Price table */}
          <Card noPadding>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio ($)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select
                          className="input-field py-1.5 text-sm"
                          value={row.productoId}
                          onChange={(e) => updateRow(row.id, 'productoId', e.target.value)}
                        >
                          <option value="">Seleccionar producto...</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          className="input-field py-1.5 w-28 text-right mono"
                          value={row.precio}
                          onChange={(e) => updateRow(row.id, 'precio', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <button onClick={() => removeRow(row.id)} className="text-[var(--text-muted)] hover:text-red-400">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addRow}>
              Agregar fila
            </Button>
            <Button icon={<Save size={14} />} onClick={handleSave}>
              Guardar precios
            </Button>
          </div>
        </div>
      )}

      {tab === 'comparar' && (
        <div className="space-y-5">
          {/* Insight */}
          {insight && insight.ahorro > 0 && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <TrendingDown size={20} className="text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Comprando en{' '}
                  <span className="font-semibold text-[var(--text-primary)]">{insight.nombre}</span>{' '}
                  ahorrarías{' '}
                  <span className="font-semibold text-emerald-400">{formatARS(insight.ahorro)}</span>{' '}
                  en tus ingredientes más usados.
                </p>
              </div>
            </Card>
          )}

          {/* Product search */}
          <input
            className="input-field"
            placeholder="Buscar producto para comparar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {comparativaProducto.length === 0 ? (
            <EmptyState
              icon={<BarChart2 size={28} />}
              title="Sin datos de precios"
              description="Cargá precios desde la pestaña anterior para comparar."
            />
          ) : (
            <>
              {/* Mini bar chart */}
              <Card>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  {productosFiltrados[0]?.nombre} — comparativa de precios
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={comparativaProducto} margin={{ left: 0, right: 10 }}>
                    <XAxis dataKey="nombre" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v) => [formatARS(v as number), 'Precio']}
                      contentStyle={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: 12 }}
                    />
                    <Bar dataKey="precio" radius={[6, 6, 0, 0]}>
                      {comparativaProducto.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#BBF7D0' : i === comparativaProducto.length - 1 ? '#FECACA' : '#F472B6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Table */}
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Supermercado</th>
                      <th>Último precio</th>
                      <th>Fecha</th>
                      <th>Δ vs. más barato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativaProducto.map((c, i) => {
                      const diff = c.precio - minPrecio;
                      return (
                        <tr key={c.superId}>
                          <td className="font-medium">{c.nombre}</td>
                          <td className="mono font-semibold" style={{ color: 'var(--pink-500)' }}>
                            {formatARS(c.precio)}
                          </td>
                          <td className="text-xs text-[var(--text-muted)]">
                            {new Date(c.fecha).toLocaleDateString('es-AR')}
                          </td>
                          <td>
                            {i === 0 ? (
                              <Badge variant="mint">✓ Más barato</Badge>
                            ) : i === comparativaProducto.length - 1 ? (
                              <Badge variant="peach">+{formatARS(diff)}</Badge>
                            ) : (
                              <span className="text-xs mono text-[var(--text-muted)]">+{formatARS(diff)}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
