import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRecetasStore } from '../store/useRecetasStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TwoPanelLayout } from '../components/ui/TwoPanelLayout';
import type { CategoriaReceta } from '../types';
import { RecetaDetail } from '../components/recetas/RecetaDetail';
import { BookOpen } from 'lucide-react';

interface FormData {
  nombre: string;
  categoria: CategoriaReceta;
  sku: string;
  descripcion: string;
  margenGanancia: number;
  descuento: number;
  impuestos: number;
}

const emptyForm: FormData = {
  nombre: '',
  categoria: 'tartas',
  sku: '',
  descripcion: '',
  margenGanancia: 50,
  descuento: 0,
  impuestos: 10,
};

const categorias: { value: CategoriaReceta | ''; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'tartas', label: 'Tartas' },
  { value: 'tortas', label: 'Tortas' },
  { value: 'galletas', label: 'Galletas' },
  { value: 'panes', label: 'Panes' },
  { value: 'otros', label: 'Otros' },
];

export const Recetas: React.FC = () => {
  const { recetas, addReceta, deleteReceta } = useRecetasStore();

  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<CategoriaReceta | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const filtered = useMemo(() => {
    return recetas.filter((r) => {
      const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategoria ? r.categoria === filterCategoria : true;
      return matchSearch && matchCat;
    });
  }, [recetas, search, filterCategoria]);

  const handleNew = () => {
    setSelectedId(null);
    setIsCreating(true);
    reset(emptyForm);
  };

  const openReceta = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const onSubmit = (data: FormData) => {
    if (isCreating) {
      addReceta({
        ...data,
        ingredientes: [],
        manoDeObra: [],
        packaging: [],
      });
      toast.success('Receta creada');
      setIsCreating(false);
    }
  };

  const handleDeleteReceta = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar la receta "${nombre}"?`)) {
      deleteReceta(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setIsCreating(false);
  };

  const selectedReceta = recetas.find((r) => r.id === selectedId);

  const leftPanel = (
    <div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-[var(--pink-400)] text-[var(--text-primary)]"
            placeholder="Buscar recetas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categorias.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCategoria(c.value as CategoriaReceta | '')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterCategoria === c.value
                  ? 'border-[var(--pink-400)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl">
          Nueva Receta
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No hay recetas"
            description="Creá tu primera receta."
            action={<Button size="sm" icon={<Plus size={16} />} onClick={handleNew}>Nueva</Button>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r) => (
              <Card
                key={r.id}
                onClick={() => openReceta(r.id)}
                className={`cursor-pointer transition-all ${
                  selectedId === r.id 
                    ? 'border-[var(--pink-400)] bg-[var(--pink-glow)]/10' 
                    : 'hover:border-[var(--pink-400)]/50'
                }`}
              >
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--pink-400)]">
                    {r.categoria}
                  </span>
                  <h3 className="font-semibold text-[var(--text-primary)]">{r.nombre}</h3>
                  <span className="text-xs text-[var(--text-muted)] mono">{r.sku}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const showForm = isCreating || selectedId;

  const rightPanel = showForm ? (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-[var(--text-primary)]">
          {isCreating ? 'Nueva' : selectedReceta?.nombre || 'Nueva'} Receta
        </h2>
        <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={closeDetail}>
          {isCreating ? 'Cancelar' : 'Cerrar'}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isCreating ? (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Nombre"
              {...register('nombre', { required: 'Nombre requerido' })}
              error={errors.nombre?.message}
              placeholder="Ej: Tarta de Ricota"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Categoría"
                {...register('categoria')}
                options={categorias.filter(c => c.value !== '')}
                error={errors.categoria?.message}
              />
              <Input
                label="SKU"
                {...register('sku', { required: 'SKU requerido' })}
                error={errors.sku?.message}
                placeholder="REC-001"
              />
            </div>
            <Input label="Descripción" {...register('descripcion')} placeholder="Descripción de la receta..." />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Margen %"
                type="number"
                {...register('margenGanancia')}
                placeholder="50"
              />
              <Input
                label="Descuento %"
                type="number"
                {...register('descuento')}
                placeholder="0"
              />
              <Input
                label="Impuestos %"
                type="number"
                {...register('impuestos')}
                placeholder="10"
              />
            </div>
            <Button type="submit" className="w-full">
              Crear Receta
            </Button>
          </form>
        ) : (
          <RecetaDetail recetaId={selectedId} onDelete={handleDeleteReceta} />
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
      <EmptyState
        icon={<BookOpen size={48} />}
        title="Seleccioná una receta"
        description="Elegí una receta de la lista o creá una nueva."
      />
    </div>
  );

  return <TwoPanelLayout leftPanel={leftPanel} rightPanel={rightPanel} />;
};