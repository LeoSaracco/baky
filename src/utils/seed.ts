import { v4 as uuidv4 } from 'uuid';
import type {
  Producto,
  PackagingItem,
  Receta,
  Presupuesto,
  Pedido,
  Supermercado,
  PrecioRegistro,
} from '../types';
import { subDays, addDays } from 'date-fns';

const now = new Date();
const fmt = (d: Date) => d.toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// Ingredientes
// ─────────────────────────────────────────────────────────────────────────────

export const seedProductos: Producto[] = [
  { id: 'p1', nombre: 'Harina 0000', categoria: 'harinas', unidad: 'g', precioActual: 1.0, proveedor: 'Molinos Río de la Plata', updatedAt: fmt(subDays(now, 2)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p2', nombre: 'Harina 000', categoria: 'harinas', unidad: 'g', precioActual: 0.8, proveedor: 'Molinos Río de la Plata', updatedAt: fmt(subDays(now, 2)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p3', nombre: 'Manteca', categoria: 'grasas', unidad: 'g', precioActual: 3.5, proveedor: 'La Serenísima', updatedAt: fmt(subDays(now, 1)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p4', nombre: 'Azúcar común', categoria: 'azucares', unidad: 'g', precioActual: 1.3, proveedor: 'Ledesma', updatedAt: fmt(subDays(now, 3)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p5', nombre: 'Azúcar impalpable', categoria: 'azucares', unidad: 'g', precioActual: 1.8, proveedor: 'Ledesma', updatedAt: fmt(subDays(now, 3)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p6', nombre: 'Huevos', categoria: 'huevos', unidad: 'unidad', precioActual: 180, proveedor: 'Granja Rancho Grande', updatedAt: fmt(subDays(now, 1)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p7', nombre: 'Levadura seca', categoria: 'levaduras', unidad: 'g', precioActual: 40.65, proveedor: 'Fleischmann', updatedAt: fmt(subDays(now, 5)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p8', nombre: 'Levadura fresca', categoria: 'levaduras', unidad: 'g', precioActual: 8.81, proveedor: 'Fleischmann', updatedAt: fmt(subDays(now, 5)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p9', nombre: 'Sal', categoria: 'condimentos', unidad: 'g', precioActual: 2.24, proveedor: 'Celusal', updatedAt: fmt(subDays(now, 7)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p10', nombre: 'Aceite', categoria: 'grasas', unidad: 'ml', precioActual: 3.33, proveedor: 'Cocinero', updatedAt: fmt(subDays(now, 4)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p11', nombre: 'Queso crema', categoria: 'lacteos', unidad: 'g', precioActual: 5.0, proveedor: 'Casancrem', updatedAt: fmt(subDays(now, 2)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p12', nombre: 'Dulce de leche', categoria: 'lacteos', unidad: 'g', precioActual: 4.2, proveedor: 'La Serenísima', updatedAt: fmt(subDays(now, 2)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p13', nombre: 'Chocolate cobertura', categoria: 'chocolates', unidad: 'g', precioActual: 8.0, proveedor: 'Barry Callebaut', updatedAt: fmt(subDays(now, 1)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p14', nombre: 'Mozzarella', categoria: 'lacteos', unidad: 'g', precioActual: 3.71, proveedor: 'Sancor', updatedAt: fmt(subDays(now, 1)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p15', nombre: 'Salame', categoria: 'carnes', unidad: 'g', precioActual: 15.0, proveedor: 'Cagnoli', updatedAt: fmt(subDays(now, 3)), createdAt: fmt(subDays(now, 30)) },
  { id: 'p16', nombre: 'Crema de leche', categoria: 'lacteos', unidad: 'ml', precioActual: 4.5, proveedor: 'La Serenísima', updatedAt: fmt(subDays(now, 2)), createdAt: fmt(subDays(now, 30)) },
];

// ─────────────────────────────────────────────────────────────────────────────
// Packaging
// ─────────────────────────────────────────────────────────────────────────────

export const seedPackaging: PackagingItem[] = [
  { id: 'pk1', nombre: 'Caja kraft 20×20', tipo: 'caja', costoUnitario: 450, notas: 'Para tortas pequeñas', createdAt: fmt(subDays(now, 20)) },
  { id: 'pk2', nombre: 'Caja kraft 30×30', tipo: 'caja', costoUnitario: 680, notas: 'Para tortas grandes', createdAt: fmt(subDays(now, 20)) },
  { id: 'pk3', nombre: 'Bolsa celofán 25×35', tipo: 'bolsa', costoUnitario: 10, createdAt: fmt(subDays(now, 20)) },
  { id: 'pk4', nombre: 'Sticker logo', tipo: 'sticker', costoUnitario: 34, notas: 'Circular 5cm diámetro', createdAt: fmt(subDays(now, 20)) },
  { id: 'pk5', nombre: 'Cinta satinada rosa', tipo: 'cinta', costoUnitario: 12, createdAt: fmt(subDays(now, 20)) },
  { id: 'pk6', nombre: 'Bandeja aluminio p33', tipo: 'bandeja', costoUnitario: 620, createdAt: fmt(subDays(now, 20)) },
];

// ─────────────────────────────────────────────────────────────────────────────
// Recetas
// ─────────────────────────────────────────────────────────────────────────────

export const seedRecetas: Receta[] = [
  {
    id: 'r1',
    nombre: 'Torta de Cumpleaños',
    categoria: 'tortas',
    sku: 'TRT-001',
    descripcion: 'Torta húmeda de chocolate con ganache y decoración clásica.',
    ingredientes: [
      { id: uuidv4(), productoId: 'p1', cantidad: 250 },
      { id: uuidv4(), productoId: 'p3', cantidad: 150 },
      { id: uuidv4(), productoId: 'p4', cantidad: 200 },
      { id: uuidv4(), productoId: 'p6', cantidad: 3 },
      { id: uuidv4(), productoId: 'p13', cantidad: 200 },
      { id: uuidv4(), productoId: 'p16', cantidad: 200 },
    ],
    manoDeObra: [
      { id: uuidv4(), actividad: 'Preparación y horneado', tarifaHora: 3000, minutos: 90 },
      { id: uuidv4(), actividad: 'Decoración', tarifaHora: 3500, minutos: 60 },
    ],
    packaging: [
      { id: uuidv4(), packagingId: 'pk2', nombre: 'Caja kraft 30×30', costoUnitario: 680, cantidad: 1 },
      { id: uuidv4(), packagingId: 'pk4', nombre: 'Sticker logo', costoUnitario: 34, cantidad: 2 },
      { id: uuidv4(), packagingId: 'pk5', nombre: 'Cinta satinada rosa', costoUnitario: 12, cantidad: 1 },
    ],
    margenGanancia: 80,
    descuento: 0,
    impuestos: 10,
    createdAt: fmt(subDays(now, 25)),
    updatedAt: fmt(subDays(now, 2)),
  },
  {
    id: 'r2',
    nombre: 'Alfajores de Maicena',
    categoria: 'galletas',
    sku: 'ALF-001',
    descripcion: 'Alfajores clásicos con dulce de leche y coco rallado. Docena.',
    ingredientes: [
      { id: uuidv4(), productoId: 'p1', cantidad: 300 },
      { id: uuidv4(), productoId: 'p3', cantidad: 200 },
      { id: uuidv4(), productoId: 'p5', cantidad: 150 },
      { id: uuidv4(), productoId: 'p12', cantidad: 300 },
    ],
    manoDeObra: [
      { id: uuidv4(), actividad: 'Preparación masa y horneado', tarifaHora: 2500, minutos: 60 },
      { id: uuidv4(), actividad: 'Relleno y armado', tarifaHora: 2500, minutos: 45 },
    ],
    packaging: [
      { id: uuidv4(), packagingId: 'pk3', nombre: 'Bolsa celofán 25×35', costoUnitario: 10, cantidad: 1 },
      { id: uuidv4(), packagingId: 'pk4', nombre: 'Sticker logo', costoUnitario: 34, cantidad: 1 },
      { id: uuidv4(), packagingId: 'pk5', nombre: 'Cinta satinada rosa', costoUnitario: 12, cantidad: 1 },
    ],
    margenGanancia: 100,
    descuento: 0,
    impuestos: 10,
    createdAt: fmt(subDays(now, 20)),
    updatedAt: fmt(subDays(now, 3)),
  },
  {
    id: 'r3',
    nombre: 'Medialunas',
    categoria: 'panes',
    sku: 'MDL-001',
    descripcion: 'Medialunas de manteca, esponjosas y con brillo almibarado. Docena.',
    ingredientes: [
      { id: uuidv4(), productoId: 'p1', cantidad: 500 },
      { id: uuidv4(), productoId: 'p3', cantidad: 250 },
      { id: uuidv4(), productoId: 'p4', cantidad: 80 },
      { id: uuidv4(), productoId: 'p7', cantidad: 10 },
      { id: uuidv4(), productoId: 'p9', cantidad: 8 },
      { id: uuidv4(), productoId: 'p6', cantidad: 2 },
    ],
    manoDeObra: [
      { id: uuidv4(), actividad: 'Amasado y fermentación', tarifaHora: 2500, minutos: 120 },
      { id: uuidv4(), actividad: 'Horneado y glaseado', tarifaHora: 2500, minutos: 30 },
    ],
    packaging: [
      { id: uuidv4(), packagingId: 'pk3', nombre: 'Bolsa celofán 25×35', costoUnitario: 10, cantidad: 2 },
      { id: uuidv4(), packagingId: 'pk4', nombre: 'Sticker logo', costoUnitario: 34, cantidad: 2 },
    ],
    margenGanancia: 90,
    descuento: 0,
    impuestos: 10,
    createdAt: fmt(subDays(now, 18)),
    updatedAt: fmt(subDays(now, 1)),
  },
  {
    id: 'r4',
    nombre: 'Grisines con Queso',
    categoria: 'panes',
    sku: 'GRS-001',
    descripcion: 'Grisines crocantes con salame y mozzarella. Bolsa x30 unidades.',
    ingredientes: [
      { id: uuidv4(), productoId: 'p2', cantidad: 400 },
      { id: uuidv4(), productoId: 'p7', cantidad: 8 },
      { id: uuidv4(), productoId: 'p9', cantidad: 10 },
      { id: uuidv4(), productoId: 'p10', cantidad: 50 },
      { id: uuidv4(), productoId: 'p14', cantidad: 100 },
      { id: uuidv4(), productoId: 'p15', cantidad: 80 },
    ],
    manoDeObra: [
      { id: uuidv4(), actividad: 'Preparación y horneado', tarifaHora: 2500, minutos: 75 },
    ],
    packaging: [
      { id: uuidv4(), packagingId: 'pk3', nombre: 'Bolsa celofán 25×35', costoUnitario: 10, cantidad: 1 },
      { id: uuidv4(), packagingId: 'pk4', nombre: 'Sticker logo', costoUnitario: 34, cantidad: 1 },
    ],
    margenGanancia: 85,
    descuento: 0,
    impuestos: 10,
    createdAt: fmt(subDays(now, 15)),
    updatedAt: fmt(subDays(now, 5)),
  },
  {
    id: 'r5',
    nombre: 'Pizza Lista Muzza',
    categoria: 'panes',
    sku: 'PZZ-001',
    descripcion: 'Pizza lista para llevar, con salsa y mozzarella, 30cm.',
    ingredientes: [
      { id: uuidv4(), productoId: 'p1', cantidad: 300 },
      { id: uuidv4(), productoId: 'p2', cantidad: 100 },
      { id: uuidv4(), productoId: 'p8', cantidad: 15 },
      { id: uuidv4(), productoId: 'p4', cantidad: 20 },
      { id: uuidv4(), productoId: 'p10', cantidad: 30 },
      { id: uuidv4(), productoId: 'p9', cantidad: 8 },
      { id: uuidv4(), productoId: 'p14', cantidad: 250 },
    ],
    manoDeObra: [
      { id: uuidv4(), actividad: 'Amasado y preparación', tarifaHora: 2500, minutos: 45 },
      { id: uuidv4(), actividad: 'Horneado', tarifaHora: 2500, minutos: 20 },
    ],
    packaging: [
      { id: uuidv4(), packagingId: 'pk6', nombre: 'Bandeja aluminio p33', costoUnitario: 620, cantidad: 1 },
      { id: uuidv4(), packagingId: 'pk3', nombre: 'Bolsa celofán 25×35', costoUnitario: 10, cantidad: 1 },
    ],
    margenGanancia: 75,
    descuento: 0,
    impuestos: 10,
    createdAt: fmt(subDays(now, 10)),
    updatedAt: fmt(subDays(now, 4)),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Supermercados
// ─────────────────────────────────────────────────────────────────────────────

export const seedSupermercados: Supermercado[] = [
  {
    id: 's1',
    nombre: 'Carrefour Palermo',
    cadena: 'Carrefour',
    direccion: 'Av. Santa Fe 3253, Palermo, Buenos Aires',
    lat: -34.5885,
    lng: -58.4255,
    notas: 'Buen stock de insumos. Descuento familiar los jueves.',
    lastVisit: fmt(subDays(now, 3)),
    createdAt: fmt(subDays(now, 15)),
  },
  {
    id: 's2',
    nombre: 'Día Soler',
    cadena: 'Día',
    direccion: 'Soler 3762, Palermo, Buenos Aires',
    lat: -34.596,
    lng: -58.4051,
    notas: 'Harina y azúcar casi siempre más barata.',
    lastVisit: fmt(subDays(now, 5)),
    createdAt: fmt(subDays(now, 15)),
  },
  {
    id: 's3',
    nombre: 'Coto Corrientes',
    cadena: 'Coto',
    direccion: 'Corrientes 3247, Almagro, Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
    notas: 'Gran variedad de packaging. Lacteos frescos.',
    lastVisit: fmt(subDays(now, 7)),
    createdAt: fmt(subDays(now, 15)),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Precios
// ─────────────────────────────────────────────────────────────────────────────

export const seedPrecios: PrecioRegistro[] = [
  // Harina 0000
  { id: 'pr1', productoId: 'p1', supermercadoId: 's1', precio: 1.15, fecha: fmt(subDays(now, 3)) },
  { id: 'pr2', productoId: 'p1', supermercadoId: 's2', precio: 0.95, fecha: fmt(subDays(now, 5)) },
  { id: 'pr3', productoId: 'p1', supermercadoId: 's3', precio: 1.05, fecha: fmt(subDays(now, 7)) },
  // Manteca
  { id: 'pr4', productoId: 'p3', supermercadoId: 's1', precio: 3.8, fecha: fmt(subDays(now, 3)) },
  { id: 'pr5', productoId: 'p3', supermercadoId: 's2', precio: 3.3, fecha: fmt(subDays(now, 5)) },
  { id: 'pr6', productoId: 'p3', supermercadoId: 's3', precio: 3.5, fecha: fmt(subDays(now, 7)) },
  // Azúcar
  { id: 'pr7', productoId: 'p4', supermercadoId: 's1', precio: 1.4, fecha: fmt(subDays(now, 3)) },
  { id: 'pr8', productoId: 'p4', supermercadoId: 's2', precio: 1.2, fecha: fmt(subDays(now, 5)) },
  { id: 'pr9', productoId: 'p4', supermercadoId: 's3', precio: 1.35, fecha: fmt(subDays(now, 7)) },
  // Huevos
  { id: 'pr10', productoId: 'p6', supermercadoId: 's1', precio: 190, fecha: fmt(subDays(now, 3)) },
  { id: 'pr11', productoId: 'p6', supermercadoId: 's3', precio: 175, fecha: fmt(subDays(now, 7)) },
  // Dulce de leche
  { id: 'pr12', productoId: 'p12', supermercadoId: 's1', precio: 4.5, fecha: fmt(subDays(now, 3)) },
  { id: 'pr13', productoId: 'p12', supermercadoId: 's2', precio: 4.0, fecha: fmt(subDays(now, 5)) },
  // Chocolate
  { id: 'pr14', productoId: 'p13', supermercadoId: 's1', precio: 8.5, fecha: fmt(subDays(now, 3)) },
  { id: 'pr15', productoId: 'p13', supermercadoId: 's3', precio: 7.8, fecha: fmt(subDays(now, 7)) },
  // Mozzarella
  { id: 'pr16', productoId: 'p14', supermercadoId: 's1', precio: 4.0, fecha: fmt(subDays(now, 3)) },
  { id: 'pr17', productoId: 'p14', supermercadoId: 's3', precio: 3.5, fecha: fmt(subDays(now, 7)) },
];

// ─────────────────────────────────────────────────────────────────────────────
// Presupuestos
// ─────────────────────────────────────────────────────────────────────────────

export const seedPresupuestos: Presupuesto[] = [
  {
    id: 'q1',
    numero: '#001',
    cliente: 'Familia García',
    fechaEmision: fmt(subDays(now, 10)),
    fechaVencimiento: fmt(addDays(now, 20)),
    notas: 'Torta de cumpleaños para el 15/05. Piso de chocolate, cobertura blanca.',
    items: [
      { id: uuidv4(), recetaId: 'r1', cantidad: 1, precioUnitario: 45000 },
    ],
    descuento: 0,
    impuestos: 10,
    estado: 'aceptado',
    createdAt: fmt(subDays(now, 10)),
    updatedAt: fmt(subDays(now, 8)),
  },
  {
    id: 'q2',
    numero: '#002',
    cliente: 'Evento TechCorp',
    fechaEmision: fmt(subDays(now, 5)),
    fechaVencimiento: fmt(addDays(now, 25)),
    notas: 'Evento corporativo. Entrega en oficinas de Nuñez.',
    items: [
      { id: uuidv4(), recetaId: 'r2', cantidad: 50, precioUnitario: 2800 },
      { id: uuidv4(), recetaId: 'r3', cantidad: 30, precioUnitario: 1800 },
    ],
    descuento: 10,
    impuestos: 10,
    estado: 'enviado',
    createdAt: fmt(subDays(now, 5)),
    updatedAt: fmt(subDays(now, 4)),
  },
  {
    id: 'q3',
    numero: '#003',
    cliente: 'Martina López',
    fechaEmision: fmt(subDays(now, 1)),
    fechaVencimiento: fmt(addDays(now, 29)),
    notas: 'Pizzas para reunión familiar. Sin cebolla.',
    items: [
      { id: uuidv4(), recetaId: 'r5', cantidad: 4, precioUnitario: 15000 },
    ],
    descuento: 0,
    impuestos: 0,
    estado: 'borrador',
    createdAt: fmt(subDays(now, 1)),
    updatedAt: fmt(subDays(now, 1)),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pedidos
// ─────────────────────────────────────────────────────────────────────────────

export const seedPedidos: Pedido[] = [
  {
    id: 'o1',
    numero: '#001',
    cliente: 'Familia García',
    fechaEntrega: fmt(addDays(now, 7)),
    notas: 'Torta de cumpleaños. Confirmar decoración.',
    items: [
      { id: uuidv4(), recetaId: 'r1', cantidad: 1, precioUnitario: 45000 },
    ],
    estado: 'en_preparacion',
    createdAt: fmt(subDays(now, 8)),
    updatedAt: fmt(subDays(now, 2)),
  },
  {
    id: 'o2',
    numero: '#002',
    cliente: 'Evento TechCorp',
    fechaEntrega: fmt(addDays(now, 3)),
    notas: 'Pedido grande corporativo. Prioridad alta.',
    items: [
      { id: uuidv4(), recetaId: 'r2', cantidad: 50, precioUnitario: 2800 },
      { id: uuidv4(), recetaId: 'r3', cantidad: 30, precioUnitario: 1800 },
    ],
    estado: 'pendiente',
    createdAt: fmt(subDays(now, 4)),
    updatedAt: fmt(subDays(now, 4)),
  },
  {
    id: 'o3',
    numero: '#003',
    cliente: 'Ana Rodríguez',
    fechaEntrega: fmt(subDays(now, 1)),
    notas: 'Entregado en mano.',
    items: [
      { id: uuidv4(), recetaId: 'r4', cantidad: 3, precioUnitario: 4200 },
    ],
    estado: 'entregado',
    createdAt: fmt(subDays(now, 7)),
    updatedAt: fmt(subDays(now, 1)),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed runner
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_KEY = 'baky_seeded_v1';

export function isSeedNeeded(): boolean {
  return !localStorage.getItem(SEED_KEY);
}

export function markSeeded(): void {
  localStorage.setItem(SEED_KEY, '1');
}
