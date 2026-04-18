import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { useProductosStore } from './store/useProductosStore';
import { usePackagingStore } from './store/usePackagingStore';
import { useRecetasStore } from './store/useRecetasStore';
import { usePresupuestosStore } from './store/usePresupuestosStore';
import { usePedidosStore } from './store/usePedidosStore';
import { useSupermercadosStore } from './store/useSupermercadosStore';
import { usePreciosStore } from './store/usePreciosStore';
import {
  isSeedNeeded,
  markSeeded,
  seedProductos,
  seedPackaging,
  seedRecetas,
  seedPresupuestos,
  seedPedidos,
  seedSupermercados,
  seedPrecios,
} from './utils/seed';

function SeedLoader() {
  const { setProductos } = useProductosStore();
  const { setItems } = usePackagingStore();
  const { setRecetas } = useRecetasStore();
  const { setPresupuestos, setNextNumero: setPresNumero } = usePresupuestosStore();
  const { setPedidos, setNextNumero: setPedNumero } = usePedidosStore();
  const { setSupermercados } = useSupermercadosStore();
  const { setPrecios } = usePreciosStore();

  useEffect(() => {
    if (isSeedNeeded()) {
      setProductos(seedProductos);
      setItems(seedPackaging);
      setRecetas(seedRecetas);
      setPresupuestos(seedPresupuestos);
      setPresNumero(4);
      setPedidos(seedPedidos);
      setPedNumero(4);
      setSupermercados(seedSupermercados);
      setPrecios(seedPrecios);
      markSeeded();
    }
  }, [
    setProductos,
    setItems,
    setRecetas,
    setPresupuestos,
    setPresNumero,
    setPedidos,
    setPedNumero,
    setSupermercados,
    setPrecios,
  ]);

  return null;
}

function App() {
  return (
    <>
      <SeedLoader />
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontFamily: "'Sora', sans-serif",
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#F472B6', secondary: '#0A0A0A' },
          },
          error: {
            iconTheme: { primary: '#FECACA', secondary: '#0A0A0A' },
          },
        }}
      />
    </>
  );
}

export default App;
