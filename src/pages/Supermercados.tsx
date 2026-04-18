import React, { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { useSupermercadosStore } from '../store/useSupermercadosStore';
import { usePreciosStore } from '../store/usePreciosStore';
import { useProductosStore } from '../store/useProductosStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatARS } from '../utils/calcCostos';
import { useIsMobile } from '../hooks/useMediaQuery';
import type { Supermercado, CadenaSupermarket } from '../types';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createPinkIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#F472B6,#C084FC);
      border:2px solid #fff;transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(244,114,182,0.5)
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

const cadenaColors: Record<CadenaSupermarket, string> = {
  Carrefour: '#0070B8',
  Día: '#E2001A',
  Coto: '#E30213',
  Jumbo: '#00963F',
  'La Anónima': '#E6001D',
  Otro: '#71717A',
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const cadenaOptions = [
  { value: 'Carrefour', label: 'Carrefour' },
  { value: 'Día', label: 'Día' },
  { value: 'Coto', label: 'Coto' },
  { value: 'Jumbo', label: 'Jumbo' },
  { value: 'La Anónima', label: 'La Anónima' },
  { value: 'Otro', label: 'Otro' },
];

export const Supermercados: React.FC = () => {
  const isMobile = useIsMobile();
  const { supermercados, addSupermercado, updateSupermercado, deleteSupermercado } = useSupermercadosStore();
  const { precios } = usePreciosStore();
  const { productos } = useProductosStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supermercado | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    cadena: 'Carrefour' as CadenaSupermarket,
    direccion: '',
    notas: '',
    lat: -34.6037,
    lng: -58.3816,
  });

  const openNew = (lat?: number, lng?: number) => {
    setEditTarget(null);
    setForm({
      nombre: '',
      cadena: 'Carrefour',
      direccion: '',
      notas: '',
      lat: lat ?? -34.6037,
      lng: lng ?? -58.3816,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Supermercado) => {
    setEditTarget(s);
    setForm({ nombre: s.nombre, cadena: s.cadena, direccion: s.direccion, notas: s.notas ?? '', lat: s.lat, lng: s.lng });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return; }
    if (editTarget) {
      updateSupermercado(editTarget.id, { ...form, lastVisit: new Date().toISOString() });
      toast.success('Supermercado actualizado');
    } else {
      addSupermercado({ ...form, lastVisit: new Date().toISOString() });
      toast.success('Supermercado agregado');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      deleteSupermercado(id);
      toast.success('Eliminado');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    openNew(lat, lng);
  };

  // Get product count per supermarket
  const precioCount = (supId: string) =>
    new Set(precios.filter((p) => p.supermercadoId === supId).map((p) => p.productoId)).size;

  const topCheapest = (supId: string) => {
    const grouped: Record<string, number[]> = {};
    precios.filter((p) => p.supermercadoId === supId).forEach((p) => {
      if (!grouped[p.productoId]) grouped[p.productoId] = [];
      grouped[p.productoId].push(p.precio);
    });
    return Object.entries(grouped)
      .map(([pid, prices]) => ({
        nombre: productos.find((p) => p.id === pid)?.nombre ?? pid,
        precio: Math.min(...prices),
      }))
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 3);
  };

  return (
    <div className={`flex gap-5 ${isMobile ? 'flex-col' : 'h-[calc(100vh-120px)]'}`}>
      {/* Left panel */}
      <div className={`flex flex-col gap-4 ${isMobile ? 'w-full' : 'w-[360px] flex-shrink-0 overflow-y-auto'}`}>
        <div className="flex justify-between items-center sticky top-0 py-2" style={{ background: 'var(--bg-base)', zIndex: 10 }}>
          <p className="text-sm text-[var(--text-muted)]">
            {supermercados.length} local{supermercados.length !== 1 ? 'es' : ''}
          </p>
          <Button icon={<Plus size={15} />} size="sm" onClick={() => openNew()}>
            Agregar
          </Button>
        </div>

        {isMobile && (
          <div style={{ height: '45vh', minHeight: 300 }}>
            <MapContainer
              center={[-34.6037, -58.3816]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {supermercados.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={createPinkIcon()}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold">{s.nombre}</p>
                      <p className="text-xs" style={{ color: cadenaColors[s.cadena] }}>{s.cadena}</p>
                      <p className="text-xs opacity-70">{s.direccion}</p>
                      <p className="text-xs opacity-50">
                        {precioCount(s.id)} productos cargados
                      </p>
                      {topCheapest(s.id).map((p) => (
                        <div key={p.nombre} className="text-xs flex justify-between gap-3">
                          <span>{p.nombre}</span>
                          <span className="font-mono text-pink-400">{formatARS(p.precio)}</span>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {supermercados.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} />}
            title="Sin supermercados"
            description="Hacé clic en el mapa o usá el botón para agregar un supermercado."
            action={<Button icon={<Plus size={16} />} onClick={() => openNew()}>Agregar supermercado</Button>}
          />
        ) : (
          supermercados.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: cadenaColors[s.cadena] }}
                    />
                    <span className="text-xs font-medium" style={{ color: cadenaColors[s.cadena] }}>{s.cadena}</span>
                  </div>
                  <p className="font-semibold text-[var(--text-primary)] truncate">{s.nombre}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{s.direccion}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="gray" size="sm">{precioCount(s.id)} productos</Badge>
                    {s.lastVisit && (
                      <span className="text-xs text-[var(--text-muted)]">
                        Visitado {new Date(s.lastVisit).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--pink-400)] hover:bg-[var(--pink-glow)] transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.nombre)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Map — desktop right panel */}
      {!isMobile && (
        <div className="flex-1 rounded-xl overflow-hidden">
          <div style={{ height: '100%', minHeight: 300 }}>
            <MapContainer
              center={[-34.6037, -58.3816]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {supermercados.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={createPinkIcon()}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold">{s.nombre}</p>
                      <p className="text-xs" style={{ color: cadenaColors[s.cadena] }}>{s.cadena}</p>
                      <p className="text-xs opacity-70">{s.direccion}</p>
                      <p className="text-xs opacity-50">
                        {precioCount(s.id)} productos cargados
                      </p>
                      {topCheapest(s.id).map((p) => (
                        <div key={p.nombre} className="text-xs flex justify-between gap-3">
                          <span>{p.nombre}</span>
                          <span className="font-mono text-pink-400">{formatARS(p.precio)}</span>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center mt-2">
            Hacé clic en el mapa para agregar un supermercado
          </p>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar supermercado' : 'Nuevo supermercado'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editTarget ? 'Guardar' : 'Agregar'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">Nombre</label>
            <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Carrefour Palermo" />
          </div>
          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">Cadena</label>
            <select className="input-field" value={form.cadena} onChange={(e) => setForm({ ...form, cadena: e.target.value as CadenaSupermarket })}>
              {cadenaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">Dirección</label>
            <input className="input-field" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Santa Fe 1234" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Latitud</label>
              <input type="number" step="0.0001" className="input-field" value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Longitud</label>
              <input type="number" step="0.0001" className="input-field" value={form.lng} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-sm text-[var(--text-muted)] mb-1 block">Notas (opcional)</label>
            <textarea className="input-field resize-none" rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Horarios, descuentos, observaciones..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};
