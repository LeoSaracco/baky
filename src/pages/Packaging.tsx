import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Box } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usePackagingStore } from '../store/usePackagingStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PackagingItem | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: '', tipo: 'caja' as const, costoUnitario: 0, notas: '' },
  });

  const openNew = () => {
    setEditTarget(null);
    reset({ nombre: '', tipo: 'caja', costoUnitario: 0, notas: '' });
    setModalOpen(true);
  };

  const openEdit = (item: PackagingItem) => {
    setEditTarget(item);
    reset({ nombre: item.nombre, tipo: item.tipo, costoUnitario: item.costoUnitario, notas: item.notas ?? '' });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editTarget) {
      updateItem(editTarget.id, data);
      toast.success('Ítem actualizado');
    } else {
      addItem(data);
      toast.success('Ítem de packaging agregado');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      deleteItem(id);
      toast.success('Ítem eliminado');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button icon={<Plus size={16} />} onClick={openNew}>
          Nuevo Ítem
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Box size={28} />}
          title="Sin packaging"
          description="Agregá cajas, bolsas, stickers y más para incluirlos en el costo de tus recetas."
          action={<Button icon={<Plus size={16} />} onClick={openNew}>Agregar packaging</Button>}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Costo unitario</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.nombre}</td>
                  <td>
                    <Badge variant={tipoColor[item.tipo]} size="sm">
                      {tipoOptions.find(o => o.value === item.tipo)?.label ?? item.tipo}
                    </Badge>
                  </td>
                  <td className="mono text-[var(--pink-500)] font-semibold">
                    {formatARS(item.costoUnitario)}
                  </td>
                  <td className="text-[var(--text-muted)] text-sm">{item.notas ?? '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--pink-400)] hover:bg-[var(--pink-glow)] transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nombre)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar packaging' : 'Nuevo ítem de packaging'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>
              {editTarget ? 'Guardar' : 'Agregar'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} placeholder="Ej: Caja kraft 20×20" />
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
        </form>
      </Modal>
    </div>
  );
};
