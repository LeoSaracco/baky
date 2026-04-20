import React, { useState } from 'react';
import { Plus, ShoppingCart, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { usePedidosStore } from '../store/usePedidosStore';
import { useRecetasStore } from '../store/useRecetasStore';
import { useProductosStore } from '../store/useProductosStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { estadoPedidoBadge, estadoPedidoLabel } from '../components/ui/BadgeHelpers';
import { EmptyState } from '../components/ui/EmptyState';
import { TwoPanelLayout } from '../components/ui/TwoPanelLayout';
import { calcCostoReceta, formatARS } from '../utils/calcCostos';
import { useIsMobile } from '../hooks/useMediaQuery';
import type { Pedido, ItemPedido } from '../types';
import { PedidoDetail } from '../components/pedidos/PedidoDetail';

export const Pedidos: React.FC = () => {
  const isMobile = useIsMobile();
  const { pedidos, addPedido, deletePedido } = usePedidosStore();
  const { recetas } = useRecetasStore();
  const { productos } = useProductosStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newForm, setNewForm] = useState({
    cliente: '',
    fechaEntrega: '',
    notas: '',
    items: [{ id: uuidv4(), recetaId: '', cantidad: 1, precioUnitario: 0 }] as ItemPedido[],
  });

  const openPedido = (p: Pedido) => {
    setSelectedId(p.id);
    setIsCreating(false);
    if (isMobile) setShowDetail(true);
  };

  const handleAddNewItemRow = () => {
    setNewForm((f) => ({
      ...f,
      items: [...f.items, { id: uuidv4(), recetaId: '', cantidad: 1, precioUnitario: 0 }],
    }));
  };

  const updateNewItem = (id: string, field: keyof ItemPedido, value: string | number) => {
    setNewForm((f) => ({
      ...f,
      items: f.items.map((i) => {
        if (i.id !== id) return i;
        if (field === 'recetaId') {
          const receta = recetas.find((r) => r.id === value);
          const precio = receta ? calcCostoReceta(receta, productos).precioVenta : 0;
          return { ...i, recetaId: value as string, precioUnitario: precio };
        }
        return { ...i, [field]: Number(value) };
      }),
    }));
  };

  const handleCreatePedido = () => {
    if (!newForm.cliente.trim()) { toast.error('El cliente es requerido'); return; }
    if (!newForm.fechaEntrega) { toast.error('La fecha de entrega es requerida'); return; }
    const validItems = newForm.items.filter((i) => i.recetaId && i.cantidad > 0);
    if (!validItems.length) { toast.error('Agregá al menos una receta'); return; }
    const nuevo = addPedido({
      cliente: newForm.cliente,
      fechaEntrega: new Date(newForm.fechaEntrega).toISOString(),
      notas: newForm.notas,
      items: validItems,
      estado: 'pendiente',
    });
    setSelectedId(nuevo.id);
    setIsCreating(false);
    toast.success('Pedido creado');
    setNewForm({
      cliente: '',
      fechaEntrega: '',
      notas: '',
      items: [{ id: uuidv4(), recetaId: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este pedido?')) {
      deletePedido(id);
      if (selectedId === id) { setSelectedId(null); setShowDetail(false); }
      toast.success('Pedido eliminado');
    }
  };

  const getPedidoTotal = (p: Pedido) =>
    p.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);

  const handleNewClick = () => {
    setIsCreating(true);
    setSelectedId(null);
  };

  const closeForm = () => {
    setIsCreating(false);
    setSelectedId(null);
  };

  if (isMobile && (showDetail || isCreating)) {
    if (isCreating) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Nuevo Pedido</h2>
            <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeForm}>Cerrar</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm text-[var(--text-muted)] mb-1 block">Fecha de entrega</label>
                <input
                  type="date"
                  className="input-field"
                  value={newForm.fechaEntrega}
                  onChange={(e) => setNewForm({ ...newForm, fechaEntrega: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Notas</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={newForm.notas}
                onChange={(e) => setNewForm({ ...newForm, notas: e.target.value })}
                placeholder="Detalles del pedido..."
              />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2">Recetas</p>
              <div className="space-y-2">
                {newForm.items.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <select
                      className="input-field flex-1 text-sm py-1.5"
                      value={item.recetaId}
                      onChange={(e) => updateNewItem(item.id, 'recetaId', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {recetas.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="input-field w-16 text-right py-1.5"
                      value={item.cantidad}
                      min={1}
                      onChange={(e) => updateNewItem(item.id, 'cantidad', e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={handleAddNewItemRow} className="mt-2">
                Agregar
              </Button>
            </div>
            <Button onClick={handleCreatePedido} className="w-full">Crear pedido</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 bg-[var(--bg-base)] min-h-screen">
        <PedidoDetail
          pedidoId={selectedId}
          onDelete={handleDelete}
          onNewClick={handleNewClick}
          onCloseMobile={() => setShowDetail(false)}
        />
      </div>
    );
  }

  const leftPanel = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--text-muted)]">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</p>
        <Button icon={<Plus size={15} />} size="sm" onClick={handleNewClick}>Nuevo</Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        {pedidos.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={28} />}
            title="Sin pedidos"
            description="Creá tu primer pedido."
            action={<Button size="sm" icon={<Plus size={16} />} onClick={handleNewClick}>Nuevo</Button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {[...pedidos]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((p) => {
                const total = getPedidoTotal(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => openPedido(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedId === p.id
                        ? 'border-[var(--pink-400)] bg-[var(--pink-glow)]/10'
                        : 'border-[var(--border-subtle)] hover:border-[var(--pink-400)]/50 bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 text-left">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold mono text-[var(--pink-500)]">{p.numero}</span>
                          <Badge variant={estadoPedidoBadge(p.estado)} size="sm">
                            {estadoPedidoLabel(p.estado)}
                          </Badge>
                        </div>
                        <p className="font-medium text-[var(--text-primary)]">{p.cliente}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(p.fechaEntrega).toLocaleDateString('es-AR')}
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
            <h2 className="font-semibold text-[var(--text-primary)]">Nuevo Pedido</h2>
            <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeForm}>Cerrar</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm text-[var(--text-muted)] mb-1 block">Fecha de entrega</label>
                <input
                  type="date"
                  className="input-field"
                  value={newForm.fechaEntrega}
                  onChange={(e) => setNewForm({ ...newForm, fechaEntrega: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--text-muted)] mb-1 block">Notas</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                value={newForm.notas}
                onChange={(e) => setNewForm({ ...newForm, notas: e.target.value })}
                placeholder="Detalles del pedido..."
              />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2">Recetas</p>
              <div className="space-y-2">
                {newForm.items.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <select
                      className="input-field flex-1 text-sm py-1.5"
                      value={item.recetaId}
                      onChange={(e) => updateNewItem(item.id, 'recetaId', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {recetas.map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="input-field w-20 text-right py-1.5"
                      value={item.cantidad}
                      min={1}
                      onChange={(e) => updateNewItem(item.id, 'cantidad', e.target.value)}
                    />
                    <span className="text-xs mono self-center text-[var(--text-muted)] w-24 text-right">
                      {formatARS(item.precioUnitario * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" icon={<Plus size={14} />} size="sm" onClick={handleAddNewItemRow} className="mt-2">
                Agregar receta
              </Button>
            </div>
            <Button onClick={handleCreatePedido} className="w-full">Crear pedido</Button>
          </div>
        </div>
      ) : selectedId ? (
        <div className="flex-1 overflow-y-auto">
          <PedidoDetail
            pedidoId={selectedId}
            onDelete={handleDelete}
            onNewClick={handleNewClick}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <EmptyState
            icon={<ShoppingCart size={48} />}
            title="Seleccioná un pedido"
            description="Elegí uno de la lista o creá uno nuevo."
          />
        </div>
      )}
    </div>
  );

  return <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
};
