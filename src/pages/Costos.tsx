import React, { useMemo, useState } from 'react';
import { DollarSign, Download, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRecetasStore } from '../store/useRecetasStore';
import { useProductosStore } from '../store/useProductosStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { calcCostoReceta, formatARS } from '../utils/calcCostos';
import { exportCostosCSV } from '../utils/exportPDF';
import { margenBadge } from '../utils/badgeHelpers';

const SortIcon: React.FC<{ col: string; sortCol: string; sortDir: 'asc' | 'desc' }> = ({ col, sortCol, sortDir }) => (
  <span className="ml-1 text-[var(--text-muted)]">
    {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
  </span>
);

export const Costos: React.FC = () => {
  const { recetas } = useRecetasStore();
  const { productos } = useProductosStore();
  const [catFilter, setCatFilter] = useState('');
  const [sortCol, setSortCol] = useState<string>('costoTotal');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [margenMin, setMargenMin] = useState(0);

  const rows = useMemo(() => {
    return recetas
      .map((r) => {
        const c = calcCostoReceta(r, productos);
        return { receta: r, ...c };
      })
      .filter((row) => {
        const matchCat = catFilter ? row.receta.categoria === catFilter : true;
        const matchMargen = row.margenReal >= margenMin;
        return matchCat && matchMargen;
      })
      .sort((a, b) => {
        const aVal = sortCol === 'nombre' ? a.receta.nombre : (a as unknown as Record<string, string | number>)[sortCol];
        const bVal = sortCol === 'nombre' ? b.receta.nombre : (b as unknown as Record<string, string | number>)[sortCol];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        const numA = typeof aVal === 'number' ? aVal : 0;
        const numB = typeof bVal === 'number' ? bVal : 0;
        return sortDir === 'asc' ? numA - numB : numB - numA;
      });
  }, [recetas, productos, catFilter, margenMin, sortCol, sortDir]);

  const totales = useMemo(() => ({
    materiales: rows.reduce((s, r) => s + r.costoMateriales, 0),
    moo: rows.reduce((s, r) => s + r.costoManoDeObra, 0),
    packaging: rows.reduce((s, r) => s + r.costoPackaging, 0),
    impuestos: rows.reduce((s, r) => s + r.impuestos, 0),
    costoTotal: rows.reduce((s, r) => s + r.costoTotal, 0),
    precioVenta: rows.reduce((s, r) => s + r.precioVenta, 0),
    margenPromedio: rows.length > 0 ? rows.reduce((s, r) => s + r.margenReal, 0) / rows.length : 0,
  }), [rows]);

  const menosRentable = rows.length > 0
    ? rows.reduce((min, r) => r.margenReal < min.margenReal ? r : min)
    : null;

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  if (recetas.length === 0) {
    return (
      <EmptyState
        icon={<DollarSign size={28} />}
        title="Sin recetas"
        description="Cargá recetas para ver el análisis de costos."
      />
    );
  }

  return (
    <div className="space-y-5">
      {menosRentable && menosRentable.margenReal < 20 && (
        <Card className="border-[var(--peach)]/30 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-[var(--text-secondary)]">
              Tu receta menos rentable es{' '}
              <span className="font-semibold text-[var(--text-primary)]">{menosRentable.receta.nombre}</span>{' '}
              con un margen de{' '}
              <span className="font-semibold text-red-400">{menosRentable.margenReal.toFixed(1)}%</span>.
              Revisá tus costos o ajustá el precio de venta.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select className="input-field w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">Todas las categorías</option>
          <option value="tortas">Tortas</option>
          <option value="panes">Panes</option>
          <option value="galletas">Galletas</option>
          <option value="otros">Otros</option>
        </select>
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-[var(--text-muted)] whitespace-nowrap">Margen mín. {margenMin}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={margenMin}
            onChange={(e) => setMargenMin(Number(e.target.value))}
            className="w-32 accent-pink-500"
          />
        </div>
        <Button
          variant="secondary"
          icon={<Download size={15} />}
          size="sm"
          onClick={() => {
            exportCostosCSV(recetas, productos);
            toast.success('CSV exportado');
          }}
        >
          Exportar CSV
        </Button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('nombre')} className="cursor-pointer">
                Receta <SortIcon col="nombre" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('costoMateriales')} className="cursor-pointer">
                Materiales <SortIcon col="costoMateriales" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('costoManoDeObra')} className="cursor-pointer">
                M. de Obra <SortIcon col="costoManoDeObra" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('costoPackaging')} className="cursor-pointer">
                Packaging <SortIcon col="costoPackaging" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('impuestos')} className="cursor-pointer">
                Impuestos <SortIcon col="impuestos" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('costoTotal')} className="cursor-pointer">
                Costo Total <SortIcon col="costoTotal" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('precioVenta')} className="cursor-pointer">
                Precio Venta <SortIcon col="precioVenta" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th onClick={() => toggleSort('margenReal')} className="cursor-pointer">
                Margen <SortIcon col="margenReal" sortCol={sortCol} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ receta, ...c }) => (
              <tr
                key={receta.id}
                style={c.margenReal < 20 ? { borderLeft: '3px solid var(--peach)' } : {}}
              >
                <td>
                  <div className="font-medium">{receta.nombre}</div>
                  <Badge variant="gray" size="sm">{receta.categoria}</Badge>
                </td>
                <td className="mono">{formatARS(c.costoMateriales)}</td>
                <td className="mono">{formatARS(c.costoManoDeObra)}</td>
                <td className="mono">{formatARS(c.costoPackaging)}</td>
                <td className="mono text-[var(--text-muted)]">{formatARS(c.impuestos)}</td>
                <td className="mono font-semibold">{formatARS(c.costoTotal)}</td>
                <td className="mono" style={{ color: 'var(--pink-500)' }}>{formatARS(c.precioVenta)}</td>
                <td>
                  <Badge variant={margenBadge(c.margenReal)}>{c.margenReal.toFixed(1)}%</Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-overlay)', borderTop: '2px solid var(--border-active)' }}>
              <td className="p-3 font-bold text-[var(--text-primary)]">Totales ({rows.length} recetas)</td>
              <td className="p-3 mono font-bold">{formatARS(totales.materiales)}</td>
              <td className="p-3 mono font-bold">{formatARS(totales.moo)}</td>
              <td className="p-3 mono font-bold">{formatARS(totales.packaging)}</td>
              <td className="p-3 mono font-bold text-[var(--text-muted)]">{formatARS(totales.impuestos)}</td>
              <td className="p-3 mono font-bold">{formatARS(totales.costoTotal)}</td>
              <td className="p-3 mono font-bold" style={{ color: 'var(--pink-500)' }}>{formatARS(totales.precioVenta)}</td>
              <td className="p-3">
                <Badge variant={margenBadge(totales.margenPromedio)}>{totales.margenPromedio.toFixed(1)}%</Badge>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
