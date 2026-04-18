import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Pedido, EstadoPedido } from '../types';

interface PedidosState {
  pedidos: Pedido[];
  nextNumero: number;
  addPedido: (data: Omit<Pedido, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => Pedido;
  updatePedido: (id: string, data: Partial<Pedido>) => void;
  updateEstado: (id: string, estado: EstadoPedido) => void;
  deletePedido: (id: string) => void;
  setPedidos: (pedidos: Pedido[]) => void;
  setNextNumero: (n: number) => void;
}

export const usePedidosStore = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],
      nextNumero: 4,
      addPedido: (data) => {
        const num = get().nextNumero;
        const newPedido: Pedido = {
          ...data,
          id: uuidv4(),
          numero: `#${String(num).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          pedidos: [...state.pedidos, newPedido],
          nextNumero: state.nextNumero + 1,
        }));
        return newPedido;
      },
      updatePedido: (id, data) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        })),
      updateEstado: (id, estado) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id ? { ...p, estado, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePedido: (id) =>
        set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) })),
      setPedidos: (pedidos) => set({ pedidos }),
      setNextNumero: (n) => set({ nextNumero: n }),
    }),
    { name: 'baky-pedidos' }
  )
);
