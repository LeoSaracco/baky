import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../ui/Badge';
import { formatARS, calcCostoReceta } from '../../utils/calcCostos';
import type { Receta, Producto } from '../../types';

interface RecetaResumenProps {
  receta: Receta;
  productos: Producto[];
  margen: number;
  setMargen: (val: number) => void;
  descuento: number;
  setDescuento: (val: number) => void;
  impuestos: number;
  setImpuestos: (val: number) => void;
}

export const RecetaResumen: React.FC<RecetaResumenProps> = ({
  receta,
  productos,
  margen,
  setMargen,
  descuento,
  setDescuento,
  impuestos,
  setImpuestos,
}) => {
  // Use a temporary receta for calculation if the values are currently being edited
  const tempReceta = { ...receta, margenGanancia: margen, descuento, impuestos };
  const costs = calcCostoReceta(tempReceta, productos);

  const chartData = [
    { name: 'Materiales', value: costs.costoMateriales, color: '#F472B6' },
    { name: 'Mano de Obra', value: costs.costoManoDeObra, color: '#C084FC' },
    { name: 'Packaging', value: costs.costoPackaging, color: '#818CF8' },
  ].filter((d) => d.value > 0);

  const margenBadge = (m: number) => {
    if (m >= 50) return 'mint';
    if (m >= 30) return 'gray';
    return 'pink';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Distribución de Costos</h3>
        <div className="h-[280px] w-full rounded-2xl bg-[var(--bg-elevated)] p-4 border border-[var(--border-subtle)]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-base)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)] italic text-sm">
              Agrega ingredientes para ver el desglose
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chartData.map((d) => (
            <div key={d.name} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] truncate">{d.name}</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-secondary)] mono">{formatARS(d.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Margin controls */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Margen %</label>
            <input
              type="number"
              className="input-field text-lg py-3"
              value={margen}
              onChange={(e) => setMargen(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Dcto %</label>
            <input
              type="number"
              className="input-field text-lg py-3"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Imp. %</label>
            <input
              type="number"
              className="input-field text-lg py-3"
              value={impuestos}
              onChange={(e) => setImpuestos(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Price output */}
        <div
          className="rounded-3xl p-8 space-y-6 relative overflow-hidden"
          style={{ background: 'var(--pink-glow)', border: '1px solid var(--border-active)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--pink-400)] mb-2 block">Precio Sugerido</span>
            <span className="text-5xl font-black mono flex items-baseline gap-1" style={{ color: 'var(--pink-500)' }}>
              <span className="text-2xl font-normal">$</span>{Math.round(costs.precioVenta).toLocaleString('es-AR')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-pink-500/20 relative">
            <div>
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 block">Ganancia Neta</span>
              <span className="text-xl font-bold text-emerald-400 mono">{formatARS(costs.gananciaNeta)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1 block">Margen Real</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[var(--text-primary)] mono">{costs.margenReal.toFixed(1)}%</span>
                <Badge variant={margenBadge(costs.margenReal)} size="sm">
                  {costs.margenReal >= 30 ? 'Top' : 'Bajo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[var(--text-muted)] italic text-center leading-relaxed">
          * El precio sugerido se calcula automáticamente basado en la suma de costos fijos, variables y el margen de rentabilidad deseado.
        </p>
      </div>
    </div>
  );
};
