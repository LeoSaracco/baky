import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { PrecioRegistro } from '../types';

interface PreciosState {
  precios: PrecioRegistro[];
  addPrecio: (data: Omit<PrecioRegistro, 'id'>) => void;
  addPrecios: (data: Omit<PrecioRegistro, 'id'>[]) => void;
  deletePrecios: (productoId: string, supermercadoId: string) => void;
  setPrecios: (precios: PrecioRegistro[]) => void;
  getLatestPrecio: (productoId: string, supermercadoId: string) => PrecioRegistro | undefined;
}

export const usePreciosStore = create<PreciosState>()(
  persist(
    (set, get) => ({
      precios: [],
      addPrecio: (data) =>
        set((state) => ({
          precios: [...state.precios, { ...data, id: uuidv4() }],
        })),
      addPrecios: (data) =>
        set((state) => ({
          precios: [
            ...state.precios,
            ...data.map((d) => ({ ...d, id: uuidv4() })),
          ],
        })),
      deletePrecios: (productoId, supermercadoId) =>
        set((state) => ({
          precios: state.precios.filter(
            (p) =>
              !(p.productoId === productoId && p.supermercadoId === supermercadoId)
          ),
        })),
      setPrecios: (precios) => set({ precios }),
      getLatestPrecio: (productoId, supermercadoId) => {
        const matching = get().precios
          .filter(
            (p) =>
              p.productoId === productoId && p.supermercadoId === supermercadoId
          )
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        return matching[0];
      },
    }),
    { name: 'baky-precios' }
  )
);
