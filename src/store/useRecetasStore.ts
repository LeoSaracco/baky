import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Receta } from '../types';

interface RecetasState {
  recetas: Receta[];
  addReceta: (data: Omit<Receta, 'id' | 'createdAt' | 'updatedAt'>) => Receta;
  updateReceta: (id: string, data: Partial<Receta>) => void;
  deleteReceta: (id: string) => void;
  setRecetas: (recetas: Receta[]) => void;
}

export const useRecetasStore = create<RecetasState>()(
  persist(
    (set) => ({
      recetas: [],
      addReceta: (data) => {
        const newReceta: Receta = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ recetas: [...state.recetas, newReceta] }));
        return newReceta;
      },
      updateReceta: (id, data) =>
        set((state) => ({
          recetas: state.recetas.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteReceta: (id) =>
        set((state) => ({ recetas: state.recetas.filter((r) => r.id !== id) })),
      setRecetas: (recetas) => set({ recetas }),
    }),
    { name: 'baky-recetas' }
  )
);
