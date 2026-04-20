import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useProductosStore } from '../store/useProductosStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TwoPanelLayout } from '../components/ui/TwoPanelLayout';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const filtered = useMemo(() => {
    return productos.filter((p) => {
      const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat ? p.categoria === filterCat : true;
      return matchSearch && matchCat;
    });
  }, [productos, search, filterCat]);

  const selectedProducto = productos.find((p) => p.id === selectedId);

  useEffect(() => {
    if (selectedProducto) {
      reset({
        nombre: selectedProducto.nombre,
        categoria: selectedProducto.categoria,
        unidad: selectedProducto.unidad,
        precioActual: selectedProducto.precioActual,
        proveedor: selectedProducto.proveedor ?? '',
      });
    }
  }, [selectedId, selectedProducto, reset]);

  const handleNew = () => {
    const nuevo = addProducto({
      nombre: 'Nuevo Ingrediente',
      categoria: 'harinas',
      unidad: 'g',
      precioActual: 0,
      proveedor: '',
    });
    setSelectedId(nuevo.id);
  };

  const openEdit = (p: Producto) => {
    setSelectedId(p.id);
  };

  const onSubmit = (data: FormData) => {
    if (selectedId) {
      updateProducto(selectedId, data);
      toast.success('Ingrediente actualizado');
    }
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      deleteProducto(id);
      if (selectedId === id) setSelectedId(null);
      toast.success('Ingrediente eliminado');
    }
  };

  const closeForm = () => {
    setSelectedId(null);
  };

  const leftPanel = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-[var(--pink-400)] text-[var(--text-primary)]"
            placeholder="Buscar ingredientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilterCat('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterCat === ''
                ? 'border-[var(--pink-400)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            Todas
          </button>
          {categoriaOptions.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterCat === c.value
                  ? 'border-[var(--pink-400)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl">
          Nuevo Ingrediente
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title="Sin ingredientes"
            description="Agregá tus ingredientes."
            action={<Button size="sm" icon={<Plus size={16} />} onClick={handleNew}>Nuevo</Button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => openEdit(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedId === p.id
                    ? 'border-[var(--pink-400)] bg-[var(--pink-glow)]/10'
                    : 'border-[var(--border-subtle)] hover:border-[var(--pink-400)]/50 bg-[var(--bg-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[var(--text-primary)]">{p.nombre}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatARS(p.precioActual)}/{p.unidad}
                    </span>
                  </div>
                  <Badge variant={categoriaColor[p.categoria]} size="sm">
                    {categoriaOptions.find(o => o.value === p.categoria)?.label ?? p.categoria}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const rightPanel = selectedId ? (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-[var(--text-primary)]">
          {selectedProducto ? 'Editar' : 'Nuevo'} Ingrediente
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedId, selectedProducto?.nombre || '')}>
            Eliminar
          </Button>
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
            placeholder="Ej: Harina 0000"
          />
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
          <Button type="submit" className="w-full">
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
      <EmptyState
        icon={<Package size={48} />}
        title="Seleccioná un ingrediente"
        description="Elegí uno de la lista o creá uno nuevo."
      />
    </div>
  );

  return <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
};
