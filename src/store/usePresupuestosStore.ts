import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Presupuesto, EstadoPresupuesto } from '../types';
import { addDays } from 'date-fns';

interface PresupuestosState {
  presupuestos: Presupuesto[];
  nextNumero: number;
  addPresupuesto: (data: Omit<Presupuesto, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => Presupuesto;
  updatePresupuesto: (id: string, data: Partial<Presupuesto>) => void;
  updateEstado: (id: string, estado: EstadoPresupuesto) => void;
  deletePresupuesto: (id: string) => void;
  duplicarPresupuesto: (id: string) => Presupuesto | null;
  setPresupuestos: (presupuestos: Presupuesto[]) => void;
  setNextNumero: (n: number) => void;
}

export const usePresupuestosStore = create<PresupuestosState>()(
  persist(
    (set, get) => ({
      presupuestos: [],
      nextNumero: 4,
      addPresupuesto: (data) => {
        const num = get().nextNumero;
        const newPres: Presupuesto = {
          ...data,
          id: uuidv4(),
          numero: `#${String(num).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          presupuestos: [...state.presupuestos, newPres],
          nextNumero: state.nextNumero + 1,
        }));
        return newPres;
      },
      updatePresupuesto: (id, data) =>
        set((state) => ({
          presupuestos: state.presupuestos.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        })),
      updateEstado: (id, estado) =>
        set((state) => ({
          presupuestos: state.presupuestos.map((p) =>
            p.id === id ? { ...p, estado, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePresupuesto: (id) =>
        set((state) => ({
          presupuestos: state.presupuestos.filter((p) => p.id !== id),
        })),
      duplicarPresupuesto: (id) => {
        const original = get().presupuestos.find((p) => p.id === id);
        if (!original) return null;
        const num = get().nextNumero;
        const duplicado: Presupuesto = {
          ...original,
          id: uuidv4(),
          numero: `#${String(num).padStart(3, '0')}`,
          estado: 'borrador',
          fechaEmision: new Date().toISOString(),
          fechaVencimiento: addDays(new Date(), 30).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          presupuestos: [...state.presupuestos, duplicado],
          nextNumero: state.nextNumero + 1,
        }));
        return duplicado;
      },
      setPresupuestos: (presupuestos) => set({ presupuestos }),
      setNextNumero: (n) => set({ nextNumero: n }),
    }),
    { name: 'baky-presupuestos' }
  )
);
