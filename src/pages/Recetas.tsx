import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { useRecetasStore } from '../store/useRecetasStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import type { CategoriaReceta } from '../types';
import { RecetaDetail } from '../components/recetas/RecetaDetail';
import { BookOpen } from 'lucide-react';

const categorias: { value: CategoriaReceta | ''; label: string }[] = [
  { value: '', label: 'Todas' },
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
  const [modalOpen, setModalOpen] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    return recetas.filter((r) => {
      const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategoria ? r.categoria === filterCategoria : true;
      return matchSearch && matchCat;
    });
  }, [recetas, search, filterCategoria]);

  const handleNew = () => {
    const nuevo = addReceta({
      nombre: 'Nueva Receta',
      categoria: 'otros',
      sku: `REC-${Math.floor(Math.random() * 10000)}`,
      descripcion: '',
      ingredientes: [],
      manoDeObra: [],
      packaging: [],
      margenGanancia: 50,
      descuento: 0,
      impuestos: 10,
    });
    setSelectedId(nuevo.id);
    setModalOpen(true);
  };

  const openReceta = (id: string) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const handleDeleteReceta = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar la receta "${nombre}"?`)) {
      deleteReceta(id);
      if (selectedId === id) {
        setSelectedId(null);
        setModalOpen(false);
      }
    }
  };

  const selectedReceta = recetas.find((r) => r.id === selectedId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 w-full text-left">
        {/* Search + filter */}
        <div className="flex flex-wrap gap-4 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm focus:ring-0 text-[var(--text-primary)]"
              placeholder="Buscar por nombre de receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 p-1.5 overflow-x-auto no-scrollbar">
            {categorias.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilterCategoria(c.value as CategoriaReceta | '')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  filterCategoria === c.value
                    ? 'border-[var(--border-active)] text-[var(--pink-400)] bg-[var(--pink-glow)]'
                    : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-base)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center pr-1.5 py-1.5">
            <Button icon={<Plus size={18} />} onClick={handleNew} className="rounded-xl px-6">
              Nueva Receta
            </Button>
          </div>
        </div>

        {/* Recipes grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No se encontraron recetas"
            description="Probá ajustando los filtros o creá una nueva receta."
            action={<Button icon={<Plus size={18} />} onClick={handleNew}>Empezar ahora</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Card
                key={r.id}
                onClick={() => openReceta(r.id)}
                className="cursor-pointer group hover:border-[var(--pink-400)] transition-all duration-300"
              >
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--pink-400)] mb-1 block">
                        {r.categoria}
                      </span>
                      <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--pink-400)] transition-colors">
                        {r.nombre}
                      </h3>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="mono">{r.sku}</span>
                    <span className="flex items-center gap-1 group-hover:text-[var(--pink-400)] transition-colors">
                      Ver detalle <Plus size={12} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
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
        title={selectedReceta ? `Editando: ${selectedReceta.nombre}` : 'Nueva Receta'}
      >
        <div className="p-2">
           <RecetaDetail
             recetaId={selectedId}
             onDelete={handleDeleteReceta}
           />
        </div>
      </Modal>
    </div>
  );
};
