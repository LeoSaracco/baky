import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useProductosStore } from '../store/useProductosStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatARS } from '../utils/calcCostos';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Producto, CategoriaIngrediente, Unidad } from '../types';

interface FormData {
  nombre: string;
  categoria: CategoriaIngrediente;
  unidad: Unidad;
  precioActual: number;
  proveedor?: string;
}

const categoriaOptions = [
  { value: 'harinas', label: 'Harinas' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'huevos', label: 'Huevos' },
  { value: 'azucares', label: 'Azúcares' },
  { value: 'grasas', label: 'Grasas y Aceites' },
  { value: 'levaduras', label: 'Levaduras' },
  { value: 'condimentos', label: 'Condimentos' },
  { value: 'chocolates', label: 'Chocolates' },
  { value: 'frutas', label: 'Frutas' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'otros', label: 'Otros' },
];

const unidadOptions = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'paquete', label: 'Paquete' },
];

const categoriaColor: Record<CategoriaIngrediente, 'pink' | 'lavender' | 'mint' | 'yellow' | 'peach' | 'gray'> = {
  harinas: 'yellow',
  lacteos: 'lavender',
  huevos: 'peach',
  azucares: 'pink',
  grasas: 'mint',
  levaduras: 'gray',
  condimentos: 'gray',
  chocolates: 'peach',
  frutas: 'mint',
  carnes: 'peach',
  otros: 'gray',
};

export const Productos: React.FC = () => {
  const { productos, addProducto, updateProducto, deleteProducto } = useProductosStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Producto | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const filtered = productos.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.categoria === filterCat : true;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setEditTarget(null);
    reset({ nombre: '', categoria: 'harinas' as const, unidad: 'g' as const, precioActual: 0, proveedor: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditTarget(p);
    reset({ nombre: p.nombre, categoria: p.categoria, unidad: p.unidad, precioActual: p.precioActual, proveedor: p.proveedor ?? '' });
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editTarget) {
      updateProducto(editTarget.id, data);
      toast.success('Ingrediente actualizado');
    } else {
      addProducto(data);
      toast.success('Ingrediente agregado');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      deleteProducto(id);
      toast.success('Ingrediente eliminado');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input-field flex-1 min-w-[180px]"
          placeholder="Buscar ingredientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field w-[160px]"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categoriaOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Button icon={<Plus size={16} />} onClick={openNew}>
          Nuevo Ingrediente
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="Sin ingredientes"
          description="Agregá tus ingredientes para comenzar a calcular costos de recetas."
          action={<Button icon={<Plus size={16} />} onClick={openNew}>Agregar ingrediente</Button>}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Precio actual</th>
                <th>Proveedor</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.nombre}</td>
                  <td>
                    <Badge variant={categoriaColor[p.categoria]} size="sm">
                      {categoriaOptions.find(o => o.value === p.categoria)?.label ?? p.categoria}
                    </Badge>
                  </td>
                  <td className="text-[var(--text-secondary)]">{p.unidad}</td>
                  <td className="mono text-[var(--pink-500)] font-semibold">
                    {formatARS(p.precioActual)}/{p.unidad}
                  </td>
                  <td className="text-[var(--text-secondary)]">{p.proveedor ?? '-'}</td>
                  <td className="text-xs text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: es })}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--pink-400)] hover:bg-[var(--pink-glow)] transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.nombre)}
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar ingrediente' : 'Nuevo ingrediente'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>
              {editTarget ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} placeholder="Ej: Harina 0000" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoría"
              {...register('categoria')}
              options={categoriaOptions}
              error={errors.categoria?.message}
            />
            <Select
              label="Unidad"
              {...register('unidad')}
              options={unidadOptions}
              error={errors.unidad?.message}
            />
          </div>
          <Input
            label="Precio actual (por unidad)"
            type="number"
            inputMode="decimal"
            step="0.01"
            {...register('precioActual')}
            error={errors.precioActual?.message}
            placeholder="0.00"
          />
          <Input label="Proveedor (opcional)" {...register('proveedor')} placeholder="Ej: Molinos Río de la Plata" />
        </form>
      </Modal>
    </div>
  );
};
