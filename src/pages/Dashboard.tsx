import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BookOpen, ClipboardList, TrendingUp,
  FileText, Tag,
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { estadoPedidoBadge, estadoPedidoLabel } from '../components/ui/BadgeHelpers';
import { useRecetasStore } from '../store/useRecetasStore';
import { useProductosStore } from '../store/useProductosStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { usePresupuestosStore } from '../store/usePresupuestosStore';
import { calcCostoReceta, formatARS } from '../utils/calcCostos';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.name === 'Costo' ? '#F472B6' : p.name === 'Precio' ? '#C084FC' : '#BBF7D0' }}>
          {p.name}: {formatARS(p.value)}
        </p>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { recetas } = useRecetasStore();
  const { productos } = useProductosStore();
  const { pedidos } = usePedidosStore();
  const { presupuestos } = usePresupuestosStore();

  const recetasActivas = recetas.length;

  // Pedidos esta semana
  const semanaAtras = new Date();
  semanaAtras.setDate(semanaAtras.getDate() - 7);
  const pedidosSemana = pedidos.filter(
    (p) => new Date(p.createdAt) >= semanaAtras
  ).length;

  // Margen promedio
  const margenPromedio = useMemo(() => {
    if (recetas.length === 0) return 0;
    const total = recetas.reduce((acc, r) => {
      const c = calcCostoReceta(r, productos);
      return acc + c.margenReal;
    }, 0);
    return total / recetas.length;
  }, [recetas, productos]);

  // Top 5 recetas por costo
  const chartData = useMemo(() => {
    return recetas
      .map((r) => {
        const c = calcCostoReceta(r, productos);
        return {
          name: r.nombre.length > 18 ? r.nombre.slice(0, 16) + '…' : r.nombre,
          Costo: Math.round(c.costoTotal),
          Precio: Math.round(c.precioVenta),
          Margen: Math.round(c.margenReal),
        };
      })
      .sort((a, b) => b.Costo - a.Costo)
      .slice(0, 5);
  }, [recetas, productos]);

  // Recent activity feed from all entities
  type FeedItem = { id: string; icon: React.ReactNode; text: string; date: Date; time: string; badge?: React.ReactNode };
  const activityFeed = useMemo((): FeedItem[] => {
    const items: FeedItem[] = [];
    
    // Add recipes
    recetas.forEach((r) => {
      items.push({
        id: `r-${r.id}`,
        icon: <BookOpen size={14} />,
        text: `Receta "${r.nombre}" creada`,
        date: new Date(r.createdAt),
        time: formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: es }),
      });
    });

    // Add orders
    pedidos.forEach((p) => {
      items.push({
        id: `o-${p.id}`,
        icon: <ClipboardList size={14} />,
        text: `Pedido ${p.numero} — ${p.cliente}`,
        date: new Date(p.updatedAt),
        time: formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: es }),
        badge: <Badge variant={estadoPedidoBadge(p.estado)} size="sm">{estadoPedidoLabel(p.estado)}</Badge>,
      });
    });

    // Add budgets
    presupuestos.forEach((q) => {
      items.push({
        id: `q-${q.id}`,
        icon: <FileText size={14} />,
        text: `Presupuesto ${q.numero} — ${q.cliente}`,
        date: new Date(q.updatedAt),
        time: formatDistanceToNow(new Date(q.updatedAt), { addSuffix: true, locale: es }),
      });
    });

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [recetas, pedidos, presupuestos]);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Recetas activas"
          value={recetasActivas}
          icon={<BookOpen size={20} />}
          iconColor="lavender"
        />
        <KpiCard
          title="Pedidos esta semana"
          value={pedidosSemana}
          icon={<ClipboardList size={20} />}
          iconColor="pink"
          trend={{ value: `${pedidosSemana}`, positive: pedidosSemana > 0 }}
        />
        <KpiCard
          title="Margen promedio"
          value={`${margenPromedio.toFixed(1)}%`}
          icon={<TrendingUp size={20} />}
          iconColor={margenPromedio >= 25 ? 'mint' : margenPromedio >= 15 ? 'yellow' : 'pink'}
          subtitle={margenPromedio >= 25 ? '¡Excelente!' : margenPromedio < 15 ? 'Revisar costos' : 'Aceptable'}
        />
        <KpiCard
          title="Presupuestos activos"
          value={presupuestos.filter(p => p.estado === 'enviado').length}
          icon={<FileText size={20} />}
          iconColor="yellow"
          subtitle="En espera"
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Rentabilidad por Receta
              </h2>
              <Badge variant="pink">Top 5 Rentabilidad</Badge>
            </div>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-[var(--text-muted)] text-sm">
                Cargá recetas para ver el gráfico
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={{ fill: '#E4E4E7', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="Precio" radius={[0, 4, 4, 0]} fill="url(#purpleGradient)" barSize={12} />
                  <Bar dataKey="Costo" radius={[0, 4, 4, 0]} fill="url(#pinkGradient)" barSize={12} />
                  <defs>
                    <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F472B6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FB923C" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#C084FC" stopOpacity={1} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs text-[var(--text-muted)]">Costo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-xs text-[var(--text-muted)]">Precio venta</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="h-full">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Actividad reciente
          </h2>
          <div className="space-y-3">
            {activityFeed.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                Sin actividad reciente
              </p>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 pb-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--pink-glow)', color: 'var(--pink-400)' }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] leading-snug">{item.text}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.time}</p>
                    {item.badge && <div className="mt-1">{item.badge}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nueva Receta', icon: <BookOpen size={18} />, path: '/recetas', color: 'pink' as const },
            { label: 'Nuevo Presupuesto', icon: <FileText size={18} />, path: '/presupuestos', color: 'lavender' as const },
            { label: 'Armar Pedido', icon: <ClipboardList size={18} />, path: '/pedidos', color: 'mint' as const },
            { label: 'Cargar Precios', icon: <Tag size={18} />, path: '/comparador', color: 'yellow' as const },
          ].map((action) => {
            const colorMap = {
              pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
              lavender: 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20',
              mint: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
              yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/20',
            };
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${colorMap[action.color]}`}
              >
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
