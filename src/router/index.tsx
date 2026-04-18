import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { Recetas } from '../pages/Recetas';
import { Productos } from '../pages/Productos';
import { Packaging } from '../pages/Packaging';
import { Costos } from '../pages/Costos';
import { Presupuestos } from '../pages/Presupuestos';
import { Pedidos } from '../pages/Pedidos';
import { Supermercados } from '../pages/Supermercados';
import { ComparadorPrecios } from '../pages/ComparadorPrecios';
import { ListaCompras } from '../pages/ListaCompras';

export const router = createBrowserRouter([
  {
    basename: '/baky',
  },
  {
    path: '/',
  {
    path: '/',
    element: <AppShell><Dashboard /></AppShell>,
  },
  {
    path: '/recetas',
    element: <AppShell><Recetas /></AppShell>,
  },
  {
    path: '/productos',
    element: <AppShell><Productos /></AppShell>,
  },
  {
    path: '/packaging',
    element: <AppShell><Packaging /></AppShell>,
  },
  {
    path: '/costos',
    element: <AppShell><Costos /></AppShell>,
  },
  {
    path: '/presupuestos',
    element: <AppShell><Presupuestos /></AppShell>,
  },
  {
    path: '/pedidos',
    element: <AppShell><Pedidos /></AppShell>,
  },
  {
    path: '/supermercados',
    element: <AppShell><Supermercados /></AppShell>,
  },
  {
    path: '/comparador',
    element: <AppShell><ComparadorPrecios /></AppShell>,
  },
  {
    path: '/lista-compras',
    element: <AppShell><ListaCompras /></AppShell>,
  },
]);
