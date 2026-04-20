// ─────────────────────────────────────────────────────────────────────────────
// Core Domain Types
// ─────────────────────────────────────────────────────────────────────────────

export type Unidad = 'g' | 'kg' | 'ml' | 'l' | 'unidad' | 'cm' | 'paquete';

export type CategoriaIngrediente =
  | 'harinas'
  | 'lacteos'
  | 'huevos'
  | 'azucares'
  | 'grasas'
  | 'levaduras'
  | 'condimentos'
  | 'chocolates'
  | 'frutas'
  | 'carnes'
  | 'otros';

export type CategoriaReceta = 'tortas' | 'tartas' | 'panes' | 'galletas' | 'otros';

export type TipoPackaging = 'caja' | 'bolsa' | 'sticker' | 'cinta' | 'bandeja' | 'otro';

export type EstadoPedido = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'vencido';

export type CadenaSupermarket =
  | 'Carrefour'
  | 'Día'
  | 'Coto'
  | 'Jumbo'
  | 'La Anónima'
  | 'Otro';

// ─────────────────────────────────────────────────────────────────────────────
// Producto / Ingrediente
// ─────────────────────────────────────────────────────────────────────────────

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaIngrediente;
  unidad: Unidad;
  precioActual: number; // precio por unidad
  proveedor?: string;
  updatedAt: string; // ISO date
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Packaging
// ─────────────────────────────────────────────────────────────────────────────

export interface PackagingItem {
  id: string;
  nombre: string;
  tipo: TipoPackaging;
  costoUnitario: number;
  notas?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recetas
// ─────────────────────────────────────────────────────────────────────────────

export interface IngredienteReceta {
  id: string;
  productoId: string;
  cantidad: number;
}

export interface ManoDeObra {
  id: string;
  actividad: string;
  tarifaHora: number;
  minutos: number;
}

export interface PackagingReceta {
  id: string;
  packagingId?: string;
  nombre: string;
  costoUnitario: number;
  cantidad: number;
}

export interface Receta {
  id: string;
  nombre: string;
  categoria: CategoriaReceta;
  sku: string;
  descripcion?: string;
  ingredientes: IngredienteReceta[];
  manoDeObra: ManoDeObra[];
  packaging: PackagingReceta[];
  margenGanancia: number; // %
  descuento: number; // %
  impuestos: number; // % default 10
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Presupuestos
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemPresupuesto {
  id: string;
  recetaId: string;
  cantidad: number;
  precioUnitario: number; // puede ser editado manualmente
}

export interface Presupuesto {
  id: string;
  numero: string; // '#001'
  cliente: string;
  fechaEmision: string;
  fechaVencimiento: string;
  notas?: string;
  items: ItemPresupuesto[];
  descuento: number; // %
  impuestos: number; // %
  estado: EstadoPresupuesto;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pedidos
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemPedido {
  id: string;
  recetaId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  fechaEntrega: string;
  notas?: string;
  items: ItemPedido[];
  estado: EstadoPedido;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supermercados
// ─────────────────────────────────────────────────────────────────────────────

export interface Supermercado {
  id: string;
  nombre: string;
  cadena: CadenaSupermarket;
  direccion: string;
  lat: number;
  lng: number;
  notas?: string;
  lastVisit?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Precios (Comparador)
// ─────────────────────────────────────────────────────────────────────────────

export interface PrecioRegistro {
  id: string;
  productoId: string;
  supermercadoId: string;
  precio: number;
  fecha: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lista de Compras
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemListaCompras {
  productoId: string;
  necesario: number;
  enStock: number;
  aComprar: number;
  unidad: Unidad;
  mejorPrecioEn?: string; // nombre del supermercado
  mejorPrecio?: number;
  comprado: boolean;
}

export interface ListaCompras {
  id: string;
  pedidoId?: string;
  items: ItemListaCompras[];
  totalEstimado: number;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Feed
// ─────────────────────────────────────────────────────────────────────────────

export type TipoActividad =
  | 'receta_creada'
  | 'receta_actualizada'
  | 'presupuesto_enviado'
  | 'presupuesto_aceptado'
  | 'pedido_creado'
  | 'pedido_entregado'
  | 'ingrediente_creado'
  | 'precios_cargados';

export interface ActividadReciente {
  id: string;
  tipo: TipoActividad;
  descripcion: string;
  timestamp: string;
  entityId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calc results
// ─────────────────────────────────────────────────────────────────────────────

export interface CostoReceta {
  costoMateriales: number;
  costoManoDeObra: number;
  costoPackaging: number;
  subtotal: number;
  impuestos: number;
  costoTotal: number;
  precioVenta: number;
  gananciaNeta: number;
  margenReal: number; // %
}
