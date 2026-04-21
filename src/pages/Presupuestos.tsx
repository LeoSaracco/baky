import React, { useState } from 'react';
import { Plus, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePresupuestosStore } from '../store/usePresupuestosStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { estadoPresupuestoBadge, estadoPresupuestoLabel } from '../components/ui/BadgeHelpers';
import { EmptyState } from '../components/ui/EmptyState';
import { TwoPanelLayout } from '../components/ui/TwoPanelLayout';
import { formatARS } from '../utils/calcCostos';
import { addDays } from 'date-fns';
import type { Presupuesto, EstadoPresupuesto } from '../types';
import { PresupuestoDetail } from '../components/presupuestos/PresupuestoDetail';
import { useIsMobile } from '../hooks/useMediaQuery';

const estadoFilters: { value: EstadoPresupuesto | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'vencido', label: 'Vencido' },
];

export const Presupuestos: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    presupuestos, addPresupuesto, deletePresupuesto, duplicarPresupuesto,
  } = usePresupuestosStore();

  const [filterEstado, setFilterEstado] = useState<EstadoPresupuesto | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    cliente: '',
    fechaVencimiento: addDays(new Date(), 30).toISOString().split('T')[0],
    notas: '',
  });

  const filtered = presupuestos.filter((p) =>
    filterEstado ? p.estado === filterEstado : true
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selected = presupuestos.find((p) => p.id === selectedId) ?? null;

  const openPresupuesto = (p: Presupuesto) => {
    setIsCreating(false);
    setSelectedId(p.id);
    if (isMobile) setShowDetail(true);
  };

  const handleNew = () => {
    setSelectedId(null);
    setIsCreating(true);
    setNewForm({
      cliente: '',
      fechaVencimiento: addDays(new Date(), 30).toISOString().split('T')[0],
      notas: '',
    });
  };

  const handleCreate = () => {
    if (!newForm.cliente.trim()) { toast.error('El cliente es requerido'); return; }
    const nuevo = addPresupuesto({
      cliente: newForm.cliente,
      fechaEmision: new Date().toISOString(),
      fechaVencimiento: new Date(newForm.fechaVencimiento).toISOString(),
      items: [],
      descuento: 0,
      impuestos: 0,
      estado: 'borrador',
      notas: newForm.notas,
    });
    setSelectedId(nuevo.id);
    setIsCreating(false);
    toast.success('Presupuesto creado');
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicarPresupuesto(id);
    if (dup) {
      setSelectedId(dup.id);
      toast.success('Presupuesto duplicado');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este presupuesto?')) {
      deletePresupuesto(id);
      if (selectedId === id) {
        setSelectedId(null);
        setShowDetail(false);
      }
      toast.success('Presupuesto eliminado');
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setShowDetail(false);
    setIsCreating(false);
  };

  const showForm = isMobile ? (isCreating || showDetail) : (isCreating || selectedId);

  if (isMobile && showForm) {
    if (isCreating) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Nuevo Presupuesto</h2>
            <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeDetail}>Cancelar</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Cliente</label>
              <input
                className="input-field"
                value={newForm.cliente}
                onChange={(e) => setNewForm({ ...newForm, cliente: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Fecha vencimiento</label>
              <input
                type="date"
                className="input-field"
                value={newForm.fechaVencimiento}
                onChange={(e) => setNewForm({ ...newForm, fechaVencimiento: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Notas</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={newForm.notas}
                onChange={(e) => setNewForm({ ...newForm, notas: e.target.value })}
                placeholder="Detalles adicionales..."
              />
            </div>
            <Button onClick={handleCreate} className="w-full">Crear</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-semibold text-[var(--text-primary)]">
            {selected ? `Presupuesto ${selected.numero}` : 'Nuevo'}
          </h2>
          <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeDetail}>Cerrar</Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PresupuestoDetail
            presupuestoId={selectedId}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            handleNew={handleNew}
          />
        </div>
      </div>
    );
  }

  const leftPanel = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {estadoFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterEstado(f.value as EstadoPresupuesto | '')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterEstado === f.value
                  ? 'border-[var(--pink-400)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl">
          Nuevo Presupuesto
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="Sin presupuestos"
            description="Creá tu primer presupuesto."
            action={<Button size="sm" icon={<Plus size={16} />} onClick={handleNew}>Nuevo</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => {
              const subtotal = p.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
              const desc = subtotal * (p.descuento / 100);
              const total = subtotal - desc;
              return (
                <div
                  key={p.id}
                  onClick={() => openPresupuesto(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedId === p.id
                      ? 'border-[var(--pink-400)] bg-[var(--pink-glow)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--pink-400)]/50 bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black mono text-sm text-[var(--pink-500)]">{p.numero}</span>
                        <Badge variant={estadoPresupuestoBadge(p.estado)} size="sm">
                          {estadoPresupuestoLabel(p.estado)}
                        </Badge>
                      </div>
                      <p className="font-bold text-[var(--text-primary)]">{p.cliente}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {p.items.length} ítems
                      </p>
                    </div>
                    <span className="font-bold mono text-sm" style={{ color: 'var(--pink-500)' }}>
                      {formatARS(total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const rightPanel = !isMobile && (
    <div className="flex flex-col h-full overflow-hidden">
      {isCreating ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Nuevo Presupuesto</h2>
            <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeDetail}>Cancelar</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Cliente</label>
              <input
                className="input-field"
                value={newForm.cliente}
                onChange={(e) => setNewForm({ ...newForm, cliente: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Fecha vencimiento</label>
              <input
                type="date"
                className="input-field"
                value={newForm.fechaVencimiento}
                onChange={(e) => setNewForm({ ...newForm, fechaVencimiento: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Notas</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={newForm.notas}
                onChange={(e) => setNewForm({ ...newForm, notas: e.target.value })}
                placeholder="Detalles adicionales..."
              />
            </div>
            <Button onClick={handleCreate} className="w-full">Crear</Button>
          </div>
        </div>
      ) : selected ? (
        <>
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h2 className="font-semibold text-[var(--text-primary)]">
              Presupuesto {selected.numero}
            </h2>
            <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeDetail}>Cerrar</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PresupuestoDetail
              presupuestoId={selectedId}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              handleNew={handleNew}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <EmptyState
            icon={<FileText size={48} />}
            title="Seleccioná un presupuesto"
            description="Elegí uno de la lista o creá uno nuevo."
          />
        </div>
      )}
    </div>
  );

  return <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
};
