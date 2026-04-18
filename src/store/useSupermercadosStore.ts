import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Supermercado } from '../types';

interface SupermercadosState {
  supermercados: Supermercado[];
  addSupermercado: (data: Omit<Supermercado, 'id' | 'createdAt'>) => void;
  updateSupermercado: (id: string, data: Partial<Supermercado>) => void;
  deleteSupermercado: (id: string) => void;
  setSupermercados: (supermercados: Supermercado[]) => void;
}

export const useSupermercadosStore = create<SupermercadosState>()(
  persist(
    (set) => ({
      supermercados: [],
      addSupermercado: (data) =>
        set((state) => ({
          supermercados: [
            ...state.supermercados,
            { ...data, id: uuidv4(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSupermercado: (id, data) =>
        set((state) => ({
          supermercados: state.supermercados.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      deleteSupermercado: (id) =>
        set((state) => ({
          supermercados: state.supermercados.filter((s) => s.id !== id),
        })),
      setSupermercados: (supermercados) => set({ supermercados }),
    }),
    { name: 'baky-supermercados' }
  )
);
