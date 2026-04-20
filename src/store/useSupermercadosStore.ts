import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Supermercado } from '../types';

interface SupermercadosState {
  supermercado: Supermercado[];
  // Alias for backwards compatibility
  supermercados: Supermercado[];
  addSupermercado: (data: Omit<Supermercado, 'id' | 'createdAt'>) => Supermercado;
  updateSupermercado: (id: string, data: Partial<Supermercado>) => void;
  deleteSupermercado: (id: string) => void;
  setSupermercados: (data: Supermercado[]) => void;
}

export const useSupermercadosStore = create<SupermercadosState>()(
  persist(
    (set) => ({
      supermercado: [],
      supermercados: [],
      addSupermercado: (data) => {
        const item: Supermercado = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ supermercado: [...state.supermercado, item], supermercados: [...state.supermercado, item] }));
        return item;
      },
      updateSupermercado: (id, data) =>
        set((state) => ({ supermercado: state.supermercado.map((s) => s.id === id ? { ...s, ...data } : s), supermercados: state.supermercado.map((s) => s.id === id ? { ...s, ...data } : s) })),
      deleteSupermercado: (id) =>
        set((state) => ({ supermercado: state.supermercado.filter((s) => s.id !== id), supermercados: state.supermercado.filter((s) => s.id !== id) })),
      setSupermercados: (data) => set({ supermercado: data, supermercados: data }),
    }),
    { name: 'baky-supermercados' }
  )
);