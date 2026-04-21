import React, { useState, useEffect } from 'react';
import { Plus, Box, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePackagingStore } from '../store/usePackagingStore';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select, Textarea } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TwoPanelLayout } from '../components/ui/TwoPanelLayout';
import { formatARS } from '../utils/calcCostos';
import type { PackagingItem, TipoPackaging } from '../types';

interface FormData {
  nombre: string;
  tipo: 'caja' | 'bolsa' | 'sticker' | 'cinta' | 'bandeja' | 'otro';
  costoUnitario: number;
  notas?: string;
}

const tipoOptions = [
  { value: 'caja', label: 'Caja' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'cinta', label: 'Cinta' },
  { value: 'bandeja', label: 'Bandeja' },
  { value: 'otro', label: 'Otro' },
];

const tipoColor: Record<TipoPackaging, 'pink' | 'lavender' | 'mint' | 'yellow' | 'gray'> = {
  caja: 'yellow',
  bolsa: 'lavender',
  sticker: 'pink',
  cinta: 'pink',
  bandeja: 'mint',
  otro: 'gray',
};

export const Packaging: React.FC = () => {
  const { items, addItem, updateItem, deleteItem } = usePackagingStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isMobile = useIsMobile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const selectedItem = items.find((i) => i.id === selectedId);

  useEffect(() => {
    if (selectedItem) {
      reset({
        nombre: selectedItem.nombre,
        tipo: selectedItem.tipo,
        costoUnitario: selectedItem.costoUnitario,
        notas: selectedItem.notas ?? '',
      });
    }
  }, [selectedId, selectedItem, reset]);

  const handleNew = () => {
    const nuevo = addItem({
      nombre: 'Nuevo Ítem',
      tipo: 'caja',
      costoUnitario: 0,
      notas: '',
    });
    setSelectedId(nuevo.id);
  };

  const openEdit = (item: PackagingItem) => {
    setSelectedId(item.id);
  };

  const onSubmit = (data: FormData) => {
    if (selectedId) {
      updateItem(selectedId, data);
      toast.success('Ítem actualizado');
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      deleteItem(id);
      if (selectedId === id) setSelectedId(null);
      toast.success('Ítem eliminado');
    }
  };

const closeForm = () => {
    setSelectedId(null);
    setIsCreating(false);
  };

  const showForm = isMobile ? (isCreating || selectedId) : selectedId;
  
  const leftPanel = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl">
        Nuevo Ítem
      </Button>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        {items.length === 0 ? (
          <EmptyState
            icon={<Box size={28} />}
            title="Sin packaging"
            description="Agregá cajas, bolsas, stickers..."
            action={<Button size="sm" icon={<Plus size={16} />} onClick={handleNew}>Nuevo</Button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedId === item.id
                    ? 'border-[var(--pink-400)] bg-[var(--pink-glow)]/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--pink-400)]/50 bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[var(--text-primary)]">{item.nombre}</span>
                    <span className="text-xs text-[var(--pink-400)] mono">
                      {formatARS(item.costoUnitario)}
                    </span>
                  </div>
                  <Badge variant={tipoColor[item.tipo]} size="sm">
                    {tipoOptions.find(o => o.value === item.tipo)?.label ?? item.tipo}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const rightPanel = showForm ? (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-[var(--text-primary)]">
          {isCreating && isMobile ? 'Nuevo' : selectedItem ? 'Editar' : 'Nuevo'} Ítem
        </h2>
        <div className="flex gap-2">
          {selectedId && (
            <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedId, selectedItem?.nombre || '')}>
              Eliminar
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeForm}>
            Cerrar
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Nombre"
            {...register('nombre', { required: 'Nombre requerido' })}
            error={errors.nombre?.message}
            placeholder="Ej: Caja kraft 20×20"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" {...register('tipo')} options={tipoOptions} error={errors.tipo?.message} />
            <Input
              label="Costo unitario ($)"
              type="number"
              inputMode="decimal"
              step="0.01"
              {...register('costoUnitario')}
              error={errors.costoUnitario?.message}
              placeholder="450"
            />
          </div>
          <Textarea label="Notas (opcional)" {...register('notas')} placeholder="Dimensiones, colores, proveedor..." />
          <Button type="submit" className="w-full">
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
      <EmptyState
        icon={<Box size={48} />}
        title="Seleccioná un ítem"
        description="Elegí uno de la lista o creá uno nuevo."
      />
    </div>
  );

  return <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
};
