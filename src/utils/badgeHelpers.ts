import type { EstadoPedido, EstadoPresupuesto } from '../types';

export type BadgeVariant = 'pink' | 'mint' | 'lavender' | 'peach' | 'yellow' | 'gray';

export function estadoPedidoBadge(estado: EstadoPedido): BadgeVariant {
  const map: Record<EstadoPedido, BadgeVariant> = {
    pendiente: 'yellow',
    en_preparacion: 'lavender',
    listo: 'mint',
    entregado: 'mint',
  };
  return map[estado];
}

export function estadoPedidoLabel(estado: EstadoPedido): string {
  const map: Record<EstadoPedido, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    entregado: 'Entregado',
  };
  return map[estado];
}

export function estadoPresupuestoBadge(estado: EstadoPresupuesto): BadgeVariant {
  const map: Record<EstadoPresupuesto, BadgeVariant> = {
    borrador: 'gray',
    enviado: 'lavender',
    aceptado: 'mint',
    vencido: 'peach',
  };
  return map[estado];
}

export function estadoPresupuestoLabel(estado: EstadoPresupuesto): string {
  const map: Record<EstadoPresupuesto, string> = {
    borrador: 'Borrador',
    enviado: 'Enviado',
    aceptado: 'Aceptado',
    vencido: 'Vencido',
  };
  return map[estado];
}

export function margenBadge(margen: number): BadgeVariant {
  if (margen >= 25) return 'mint';
  if (margen >= 15) return 'yellow';
  return 'peach';
}
