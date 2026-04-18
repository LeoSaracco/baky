import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Producto } from '../types';

interface ProductosState {
  productos: Producto[];
  addProducto: (data: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProducto: (id: string, data: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  setProductos: (productos: Producto[]) => void;
}

export const useProductosStore = create<ProductosState>()(
  persist(
    (set) => ({
      productos: [],
      addProducto: (data) =>
        set((state) => ({
          productos: [
            ...state.productos,
            {
              ...data,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateProducto: (id, data) =>
        set((state) => ({
          productos: state.productos.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteProducto: (id) =>
        set((state) => ({
          productos: state.productos.filter((p) => p.id !== id),
        })),
      setProductos: (productos) => set({ productos }),
    }),
    { name: 'baky-productos' }
  )
);
