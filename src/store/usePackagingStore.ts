import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { PackagingItem } from '../types';

interface PackagingState {
  items: PackagingItem[];
  addItem: (data: Omit<PackagingItem, 'id' | 'createdAt'>) => PackagingItem;
  updateItem: (id: string, data: Partial<PackagingItem>) => void;
  deleteItem: (id: string) => void;
  setItems: (items: PackagingItem[]) => void;
}

export const usePackagingStore = create<PackagingState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (data) => {
        const newItem: PackagingItem = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
        return newItem;
      },
      updateItem: (id, data) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      deleteItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setItems: (items) => set({ items }),
    }),
    { name: 'baky-packaging' }
  )
);
