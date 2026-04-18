import type {
  Receta,
  Producto,
  CostoReceta,
  ItemListaCompras,
  Supermercado,
  PrecioRegistro,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Calculo de costos de una receta
// ─────────────────────────────────────────────────────────────────────────────

export function calcCostoReceta(
  receta: Receta,
  productos: Producto[]
): CostoReceta {
  const productoMap = new Map(productos.map((p) => [p.id, p]));

  const costoMateriales = receta.ingredientes.reduce((acc, ing) => {
    const prod = productoMap.get(ing.productoId);
    if (!prod) return acc;
    return acc + prod.precioActual * ing.cantidad;
  }, 0);

  const costoManoDeObra = receta.manoDeObra.reduce((acc, m) => {
    return acc + (m.tarifaHora / 60) * m.minutos;
  }, 0);

  const costoPackaging = receta.packaging.reduce((acc, p) => {
    return acc + p.costoUnitario * p.cantidad;
  }, 0);

  const subtotal = costoMateriales + costoManoDeObra + costoPackaging;
  const impuestos = subtotal * (receta.impuestos / 100);
  const costoTotal = subtotal + impuestos;

  const margenFactor = 1 + receta.margenGanancia / 100;
  const descuentoFactor = 1 - receta.descuento / 100;
  const precioVenta = costoTotal * margenFactor * descuentoFactor;
  const gananciaNeta = precioVenta - costoTotal;
  const margenReal =
    precioVenta > 0 ? ((gananciaNeta / precioVenta) * 100) : 0;

  return {
    costoMateriales,
    costoManoDeObra,
    costoPackaging,
    subtotal,
    impuestos,
    costoTotal,
    precioVenta,
    gananciaNeta,
    margenReal,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Calcular precio de venta de una receta para presupuesto
// ─────────────────────────────────────────────────────────────────────────────

export function getPrecioVentaReceta(
  receta: Receta,
  productos: Producto[]
): number {
  return calcCostoReceta(receta, productos).precioVenta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lista de compras: aggregar ingredientes por receta × cantidad
// ─────────────────────────────────────────────────────────────────────────────

export function calcListaCompras(
  items: Array<{ recetaId: string; cantidad: number }>,
  recetas: Receta[],
  productos: Producto[],
  supermercados: Supermercado[],
  precios: PrecioRegistro[]
): ItemListaCompras[] {
  const recetaMap = new Map(recetas.map((r) => [r.id, r]));
  const productoMap = new Map(productos.map((p) => [p.id, p]));
  const ingTotales = new Map<string, number>();

  for (const item of items) {
    const receta = recetaMap.get(item.recetaId);
    if (!receta) continue;
    for (const ing of receta.ingredientes) {
      const prev = ingTotales.get(ing.productoId) ?? 0;
      ingTotales.set(ing.productoId, prev + ing.cantidad * item.cantidad);
    }
  }

  const superMap = new Map(supermercados.map((s) => [s.id, s]));

  const result: ItemListaCompras[] = [];
  for (const [productoId, necesario] of ingTotales.entries()) {
    const prod = productoMap.get(productoId);
    if (!prod) continue;

    // Find best price
    const preciosProducto = precios.filter((p) => p.productoId === productoId);
    let mejorPrecio: number | undefined;
    let mejorPrecioEn: string | undefined;

    if (preciosProducto.length > 0) {
      const sorted = [...preciosProducto].sort((a, b) => a.precio - b.precio);
      mejorPrecio = sorted[0].precio;
      const super_ = superMap.get(sorted[0].supermercadoId);
      mejorPrecioEn = super_?.nombre;
    }

    result.push({
      productoId,
      necesario,
      enStock: 0,
      aComprar: necesario,
      unidad: prod.unidad,
      mejorPrecio,
      mejorPrecioEn,
      comprado: false,
    });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Format currency ARS
// ─────────────────────────────────────────────────────────────────────────────

export function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
