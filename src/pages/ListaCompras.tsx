import React, { useState, useMemo } from 'react';
import { Plus, Share2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useRecetasStore } from '../store/useRecetasStore';
import { useProductosStore } from '../store/useProductosStore';
import { useSupermercadosStore } from '../store/useSupermercadosStore';
import { usePreciosStore } from '../store/usePreciosStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { calcListaCompras, formatARS } from '../utils/calcCostos';
import { compartirWhatsApp } from '../utils/exportPDF';
import { useIsMobile } from '../hooks/useMediaQuery';

// Fix leaflet icons
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PedidoItem {
  id: string;
  recetaId: string;
  cantidad: number;
}

const STEPS = ['Pedido', 'Lista de compras', 'Ruta'];

const StepBar: React.FC<{ step: number; setStep: (s: number) => void }> = ({ step, setStep }) => (
  <div className="flex items-center gap-1 mb-6">
    {STEPS.map((s, i) => (
      <React.Fragment key={s}>
        <button
          onClick={() => i < step + 1 && setStep(i)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i === step
              ? 'text-[var(--pink-400)] bg-[var(--pink-glow)] border border-[var(--border-active)]'
              : i < step
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-overlay)]'}`}>
            {i < step ? <Check size={10} /> : i + 1}
          </span>
          {s}
        </button>
        {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[var(--border-subtle)]" />}
      </React.Fragment>
    ))}
  </div>
);

export const ListaCompras: React.FC = () => {
  const isMobile = useIsMobile();
  const { recetas } = useRecetasStore();
  const { productos } = useProductosStore();
  const { supermercados } = useSupermercadosStore();
  const { precios } = usePreciosStore();

  const [step, setStep] = useState(0);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([{ id: uuidv4(), recetaId: '', cantidad: 1 }]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const addPedidoItem = () =>
    setPedidoItems((prev) => [...prev, { id: uuidv4(), recetaId: '', cantidad: 1 }]);

  const updatePedidoItem = (id: string, field: 'recetaId' | 'cantidad', value: string | number) =>
    setPedidoItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: field === 'recetaId' ? value : Number(value) } : i))
    );

  const removePedidoItem = (id: string) =>
    setPedidoItems((prev) => prev.filter((i) => i.id !== id));

  // Generate shopping list
  const listaItems = useMemo(() => {
    const validItems = pedidoItems.filter((i) => i.recetaId && i.cantidad > 0);
    return calcListaCompras(validItems, recetas, productos, supermercados, precios);
  }, [pedidoItems, recetas, productos, supermercados, precios]);

  const totalEstimado = useMemo(() =>
    listaItems.reduce((s, i) => {
      if (!i.mejorPrecio) return s;
      return s + i.mejorPrecio * i.aComprar;
    }, 0),
    [listaItems]
  );

  // Route planning
  const paradas = useMemo(() => {
    const bySuper: Record<string, typeof listaItems> = {};
    listaItems.forEach((item) => {
      if (item.mejorPrecioEn) {
        const key = item.mejorPrecioEn;
        if (!bySuper[key]) bySuper[key] = [];
        bySuper[key].push(item);
      }
    });
    return Object.entries(bySuper).map(([nombre, items], i) => {
      const super_ = supermercados.find((s) => s.nombre === nombre);
      const total = items.reduce((s, it) => s + (it.mejorPrecio ?? 0) * it.aComprar, 0);
      return { nombre, super: super_, items, total, index: i + 1 };
    });
  }, [listaItems, supermercados]);

  const routeCoords = paradas
    .filter((p) => p.super)
    .map((p) => [p.super!.lat, p.super!.lng] as [number, number]);

  const toggleChecked = (productoId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) next.delete(productoId);
      else next.add(productoId);
      return next;
    });
  };

  const handleWhatsApp = () => {
    const lines = [
      '🛒 *Lista de compras - Baky*\n',
      ...listaItems.map((item) => {
        const prod = productos.find(p => p.id === item.productoId);
        return `• ${prod?.nombre ?? item.productoId}: ${item.aComprar} ${item.unidad}${item.mejorPrecioEn ? ` → ${item.mejorPrecioEn}` : ''}`;
      }),
      `\n💰 *Total estimado: ${formatARS(totalEstimado)}*`,
    ];
    compartirWhatsApp(lines.join('\n'));
  };

  const productoMap = new Map(productos.map((p) => [p.id, p]));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <StepBar step={step} setStep={setStep} />

      {/* Step 0: New order */}
      {step === 0 && (
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Recetas del pedido</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-overlay)' }}>
                  <th className="p-2 text-left">Receta</th>
                  <th className="p-2 text-right">Cantidad</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {pedidoItems.map((item) => {
                  return (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td className="p-2">
                        <select
                          className="input-field py-1.5 text-sm"
                          value={item.recetaId}
                          onChange={(e) => updatePedidoItem(item.id, 'recetaId', e.target.value)}
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
                          min={1}
                          onChange={(e) => updatePedidoItem(item.id, 'cantidad', e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-center text-[var(--text-muted)]">
                        <button onClick={() => removePedidoItem(item.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={addPedidoItem}>
              Agregar receta
            </Button>
            <Button onClick={() => setStep(1)} disabled={!pedidoItems.some((i) => i.recetaId)}>
              Generar lista →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Shopping list */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {listaItems.length} ingrediente{listaItems.length !== 1 ? 's' : ''} a comprar
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Total estimado:{' '}
                <span className="mono text-[var(--pink-400)] font-semibold">{formatARS(totalEstimado)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Share2 size={14} />} size="sm" onClick={handleWhatsApp}>
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Ingrediente</th>
                  <th>Necesario</th>
                  <th>A comprar</th>
                  <th>Unidad</th>
                  <th>Mejor precio en</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {listaItems.map((item) => {
                  const prod = productoMap.get(item.productoId);
                  const isChecked = checkedItems.has(item.productoId);
                  return (
                    <tr key={item.productoId} style={isChecked ? { opacity: 0.5 } : {}}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecked(item.productoId)}
                          className="w-4 h-4 accent-pink-500"
                        />
                      </td>
                      <td className={`font-medium ${isChecked ? 'line-through' : ''}`}>
                        {prod?.nombre ?? item.productoId}
                      </td>
                      <td className="mono text-[var(--text-muted)]">{item.necesario}</td>
                      <td className="mono font-bold text-[var(--pink-400)]">{item.aComprar}</td>
                      <td className="text-xs text-[var(--text-muted)]">{item.unidad}</td>
                      <td>
                        {item.mejorPrecioEn ? (
                          <Badge variant="mint" size="sm">{item.mejorPrecioEn}</Badge>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Sin datos</span>
                        )}
                      </td>
                      <td className="mono text-xs text-[var(--text-muted)]">
                        {item.mejorPrecio ? formatARS(item.mejorPrecio) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 sticky bottom-4">
            <Button variant="ghost" onClick={() => setStep(0)}>← Volver</Button>
            <Button onClick={() => setStep(2)} disabled={paradas.length === 0}>
              Ver ruta de compra →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Route */}
      {step === 2 && (
        <div className={`flex gap-5 ${isMobile ? 'flex-col' : ''}`}>
          {/* Map */}
          <div className={`${isMobile ? 'h-[45vh]' : 'flex-1'} rounded-xl overflow-hidden`} style={{ minHeight: 300 }}>
            <MapContainer
              center={paradas.length > 0 && paradas[0].super ? [paradas[0].super.lat, paradas[0].super.lng] : [-34.6037, -58.3816]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              {paradas.filter((p) => p.super).map((parada) => (
                <Marker key={parada.nombre} position={[parada.super!.lat, parada.super!.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">Parada {parada.index}: {parada.nombre}</p>
                      <p className="text-xs">{parada.items.length} ingrediente{parada.items.length !== 1 ? 's' : ''}</p>
                      <p className="font-mono text-pink-400">{formatARS(parada.total)}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {routeCoords.length > 1 && (
                <Polyline positions={routeCoords} color="#F472B6" weight={3} dashArray="8 4" opacity={0.7} />
              )}
            </MapContainer>
          </div>

          {/* Stops list */}
          <div className={`${isMobile ? 'w-full' : 'w-[320px]'} space-y-3 overflow-y-auto flex-shrink-0 text-left`}>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {paradas.length} parada{paradas.length !== 1 ? 's' : ''}
            </h3>
            {paradas.map((parada) => (
              <Card key={parada.nombre} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {parada.index}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{parada.nombre}</p>
                    <p className="text-xs text-[var(--text-muted)]">{parada.super?.direccion}</p>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {parada.items.map((item) => {
                    const prod = productoMap.get(item.productoId);
                    return (
                      <div key={item.productoId} className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">{prod?.nombre}</span>
                        <span className="mono text-[var(--text-muted)]">{item.aComprar} {item.unidad}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <Badge variant="pink" size="sm">{parada.items.length} ítems</Badge>
                  <span className="mono font-bold text-sm" style={{ color: 'var(--pink-500)' }}>
                    {formatARS(parada.total)}
                  </span>
                </div>
              </Card>
            ))}

            <div className="flex gap-2 sticky bottom-4">
              <Button variant="ghost" onClick={() => setStep(1)} size="sm">← Lista</Button>
              <Button icon={<Share2 size={14} />} size="sm" onClick={handleWhatsApp}>
                Compartir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
