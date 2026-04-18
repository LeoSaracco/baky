# Baky - Documentación para Validación Funcional

## URL de Producción
https://leosaracco.github.io/baky/

## Stack Tecnológico
- React 19 + React Router 7
- TypeScript
- Vite (build)
- Tailwind CSS
- Zustand (state management con persistencia localStorage)
- react-hook-form
- Zod v4

---

## Funcionalidades a Validar

### 1. Recetas (`/recetas`)
**Descripción**: Gestión de recetas de pastelería/panadería

** Tipo **:
```typescript
interface Receta {
  id: string;
  nombre: string;
  categoria: 'tortas' | 'panes' | 'galletas' | 'otros';
  sku: string;
  descripcion?: string;
  ingredientes: { id: string; productoId: string; cantidad: number }[];
  manoDeObra: { id: string; actividad: string; tarifaHora: number; minutos: number }[];
  packaging: { id: string; packagingId?: string; nombre: string; costoUnitario: number; cantidad: number }[];
  margenGanancia: number; // %
  descuento: number; // %
  impuestos: number; // %
}
```

**Flujo expected**:
1. Usuario ve lista de recetas en sidebar
2. Click en receta → panel detallado a la derecha
3. Editar ingredientes, mano de obra, packaging
4. Guardado automático en localStorage

**Validar**:
- [ ] Crear nueva receta con todos los campos
- [ ] Editar receta existente
- [ ] Agregar ingrediente con cantidad
- [ ] Agregar packaging
- [ ] Calcular costo correctamente

---

### 2. Productos (`/productos`)
**Descripción**: Catálogo de ingredientes/materiales

**Tipo**:
```typescript
interface Producto {
  id: string;
  nombre: string;
  categoria: 'harinas' | 'lacteos' | 'huevos' | 'azucares' | 'grasas' | 'levaduras' | 'condimentos' | 'chocolates' | 'frutas' | 'carnes' | 'otros';
  unidad: 'g' | 'kg' | 'ml' | 'l' | 'unidad' | 'cm' | 'paquete';
  precioActual: number;
  proveedor?: string;
}
```

**Validar**:
- [ ] Crear producto con todos los campos
- [ ] Editar producto
- [ ] Filtrar por categoría
- [ ] Buscar por nombre

---

### 3. Packaging (`/packaging`)
**Descripción**: Materiales de empaque (cajas, bolsas, stickers, etc.)

**Tipo**:
```typescript
interface PackagingItem {
  id: string;
  nombre: string;
  tipo: 'caja' | 'bolsa' | 'sticker' | 'cinta' | 'bandeja' | 'otro';
  costoUnitario: number;
  notas?: string;
}
```

**Validar**:
- [ ] Crear item de packaging
- [ ] Editar item
- [ ] Delete item

---

### 4. Costos (`/costos`)
**Descripción**: Análisis de rentabilidad de recetas

**Cálculos expected**:
```
costoMateriales = sum(producto.precioActual * cantidad)
costoManoDeObra = sum(tarifaHora * minutos / 60)
costoPackaging = sum(costoUnitario * cantidad)
subtotal = costoMateriales + costoManoDeObra + costoPackaging
impuestos = subtotal * (receta.impuestos / 100)
costoTotal = subtotal + impuestos
precioVenta = costoTotal / (1 - receta.margenGanancia / 100)
gananciaNeta = precioVenta - costoTotal
margenReal = (gananciaNeta / precioVenta) * 100
```

**Validar**:
- [ ] Mostrar tabla con todas las recetas y sus costos
- [ ] Calcular correctamente para cada receta
- [ ] Filtrar por categoría
- [ ] Ordenar por columna
- [ ] Calcular totales

---

### 5. Pedidos (`/pedidos`)
**Descripción**: Gestión de pedidos de clientes

**Tipo**:
```typescript
interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  fechaEntrega: string;
  notas?: string;
  items: { id: string; recetaId: string; cantidad: number; precioUnitario: number }[];
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';
}
```

**Validar**:
- [ ] Crear pedido seleccionando recetas
- [ ] Cambiar estado (pendiente → en_preparacion → listo → entregado)
- [ ] Mostrar badge de estado con color correcto

---

### 6. Presupuestos (`/presupuestos`)
**Descripción**: Cotizaciones para clientes

**Tipo**:
```typescript
interface Presupuesto {
  id: string;
  numero: string;
  cliente: string;
  fechaEmision: string;
  fechaVencimiento: string;
  notas?: string;
  items: { id: string; recetaId: string; cantidad: number; precioUnitario: number }[];
  descuento: number; // %
  impuestos: number; // %
  estado: 'borrador' | 'enviado' | 'aceptado' | 'vencido';
}
```

**Validar**:
- [ ] Crear presupuesto desde recipes
- [ ] Aplicar descuento
- [ ] Cambiar estado
- [ ] Calcular total correctamente

---

### 7. Supermercados (`/supermercados`)
**Descripción**: Mapa de supermercados para comparar precios

**Tipo**:
```typescript
interface Supermercado {
  id: string;
  nombre: string;
  cadena: 'Carrefour' | 'Día' | 'Coto' | 'Jumbo' | 'La Anónima' | 'Otro';
  direccion: string;
  lat: number;
  lng: number;
}
```

**Validar**:
- [ ] Agregar supermercado con coordenadas
- [ ] Mostrar en mapa

---

### 8. Comparador de Precios (`/comparador`)
**Descripción**: Comparar precios entre supermercados

**Tipo**:
```typescript
interface PrecioRegistro {
  id: string;
  productoId: string;
  supermercadoId: string;
  precio: number;
  fecha: string;
}
```

**Validar**:
- [ ] Registrar precio por producto y supermercado
- [ ] Mostrar tabla comparativa

---

### 9. Lista de Compras (`/lista-compras`)
**Descripción**: Generar lista de compras desde pedidos

**Validar**:
- [ ] Generar desde pedido
- [ ] Calcular necesarios vs stock

---

## Componentes UI Reutilizables

- `Button` - botones con variantes
- `Input`, `Select`, `Textarea` - campos de formulario
- `Modal` - diálogos
- `Card` - contenedores
- `Badge` - etiquetas de estado
- `EmptyState` - cuando no hay datos
- `Table` - tablas
- `Tabs` - pestañas
- `Accordion` - acordeón

---

## Estado (Zustand stores)

Los datos se guardan en localStorage con clave `baky-*`:
- `baky-recetas` - Recetas
- `baky-productos` - Productos
- `baky-packaging` - Packaging
- `baky-pedidos` - Pedidos
- `baky-presupuestos` - Presupuestos
- `baky-supermercados` - Supermercados
- `baky-precios` - Precios
- `baky-costos` - Costos guardados

---

## Rutas

```typescript
const routes = [
  { path: '/' },
  { path: '/recetas' },
  { path: '/productos' },
  { path: '/packaging' },
  { path: '/costos' },
  { path: '/presupuestos' },
  { path: '/pedidos' },
  { path: '/supermercados' },
  { path: '/comparador' },
  { path: '/lista-compras' },
];
```

**Nota**: La app usa `basename: '/baky'` para GitHub Pages

---

## Para Testing Manual

1. Ir a https://leosaracco.github.io/baky/
2. Crear algunos productos primero (necesarios para recetas)
3. Crear packaging
4. Crear recetas usando productos existentes
5. Verificar cálculos en página Costos
6. Crear pedidos y presupuestos
7. Probar todas las funcionalidades CRUD

---

## Tests Automatizados (para implementar)

```typescript
// Ejemplo de test con Vitest
test('calculo costo de receta', () => {
  const receta = {
    ingredientes: [{ productoId: 'p1', cantidad: 500 }],
    manoDeObra: [{ tarifaHora: 1000, minutos: 60 }],
    packaging: [{ costoUnitario: 50, cantidad: 1 }],
    margenGanancia: 30,
    impuestos: 10,
  };
  const resultado = calcCostoReceta(receta, productos);
  expect(resultado.precioVenta).toBeGreaterThan(0);
});
```