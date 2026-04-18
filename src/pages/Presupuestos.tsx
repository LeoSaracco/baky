import React, { useState } from 'react';
import { Plus, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePresupuestosStore } from '../store/usePresupuestosStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { estadoPresupuestoBadge, estadoPresupuestoLabel } from '../components/ui/BadgeHelpers';
import { EmptyState } from '../components/ui/EmptyState';
import { formatARS } from '../utils/calcCostos';
import { addDays } from 'date-fns';
import { Modal } from '../components/ui/Modal';
import type { Presupuesto, EstadoPresupuesto } from '../types';
import { PresupuestoDetail } from '../components/presupuestos/PresupuestoDetail';

const estadoFilters: { value: EstadoPresupuesto | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'aceptado', label: 'Aceptado' },
  { value: 'vencido', label: 'Vencido' },
];

export const Presupuestos: React.FC = () => {
  const {
    presupuestos, addPresupuesto, deletePresupuesto, duplicarPresupuesto,
  } = usePresupuestosStore();

  const [filterEstado, setFilterEstado] = useState<EstadoPresupuesto | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = presupuestos.filter((p) =>
    filterEstado ? p.estado === filterEstado : true
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selected = presupuestos.find((p) => p.id === selectedId) ?? null;

  const openPresupuesto = (p: Presupuesto) => {
    setSelectedId(p.id);
    setModalOpen(true);
  };

  const handleNew = () => {
    const nuevo = addPresupuesto({
      cliente: 'Nuevo cliente',
      fechaEmision: new Date().toISOString(),
      fechaVencimiento: addDays(new Date(), 30).toISOString(),
      items: [],
      descuento: 0,
      impuestos: 0,
      estado: 'borrador',
    });
    setSelectedId(nuevo.id);
    setModalOpen(true);
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
        setModalOpen(false);
      }
      toast.success('Presupuesto eliminado');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 w-full text-left">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-4 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex gap-2 p-1.5 overflow-x-auto no-scrollbar flex-1">
            {estadoFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterEstado(f.value as EstadoPresupuesto | '')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  filterEstado === f.value
                    ? 'border-[var(--border-active)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                    : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center pr-1.5 py-1.5">
            <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl px-6">
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        {/* Budgets grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="Aún no tienes presupuestos"
            description="Crea tu primer presupuesto para enviárselo a tus clientes."
            action={<Button icon={<Plus size={18} />} onClick={handleNew}>Empezar ahora</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const subtotal = p.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
              const desc = subtotal * (p.descuento / 100);
              const total = subtotal - desc;
              return (
                <Card
                  key={p.id}
                  onClick={() => openPresupuesto(p)}
                  className="cursor-pointer group hover:border-[var(--pink-400)] transition-all duration-300"
                >
                  <div className="space-y-4 text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-black mono text-[var(--pink-500)] text-lg">{p.numero}</span>
                          <Badge variant={estadoPresupuestoBadge(p.estado)} size="sm">
                            {estadoPresupuestoLabel(p.estado)}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--pink-400)] transition-colors line-clamp-1">
                          {p.cliente}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black mono text-[var(--text-primary)]">
                          {formatARS(total)}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Neto</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-4">
                         <span className="flex items-center gap-1">
                           <FileText size={12} /> {p.items.length} ítem{p.items.length !== 1 ? 's' : ''}
                         </span>
                         <span>{new Date(p.fechaEmision).toLocaleDateString('es-AR')}</span>
                      </div>
                      <Send size={14} className="group-hover:text-[var(--pink-400)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedId(null);
        }}
        size="xl"
        title={selected ? `Presupuesto ${selected.numero}` : 'Nuevo Presupuesto'}
      >
        <div className="p-2">
           <PresupuestoDetail
             presupuestoId={selectedId}
             onDelete={handleDelete}
             onDuplicate={handleDuplicate}
             handleNew={handleNew}
           />
        </div>
      </Modal>
    </div>
  );
};
