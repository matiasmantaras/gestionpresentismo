import { useEffect, useState } from 'react'
import { BarChart3, Users, Star, Heart, TrendingUp, Calendar, QrCode, Activity, RefreshCw } from 'lucide-react'
import { getEstadisticas, getAsistenciasRecientes } from '../../utils/supabaseStorage'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    miembros: { total: 0, percentage: 0, lastMonth: [] },
    lideres: { total: 0, percentage: 0, lastMonth: [] },
    jovenes: { total: 0, percentage: 0, lastMonth: [] },
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [loadedStats, activity] = await Promise.all([
        getEstadisticas(),
        getAsistenciasRecientes()
      ])
      setStats(loadedStats)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPersonas = stats.miembros.total + stats.lideres.total + stats.jovenes.total
  const avgAttendance = totalPersonas > 0 
    ? Math.round((stats.miembros.percentage + stats.lideres.percentage + stats.jovenes.percentage) / 3)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-300">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  const modules = [
    {
      id: 'miembros',
      title: 'Miembros Generales',
      description: 'Cultos regulares',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      stats: stats.miembros,
      glowColor: 'rgba(16, 185, 129, 0.3)',
    },
    {
      id: 'lideres',
      title: 'Líderes de Ministerio',
      description: 'Reuniones de liderazgo',
      icon: Star,
      gradient: 'from-amber-500 to-orange-500',
      stats: stats.lideres,
      glowColor: 'rgba(245, 158, 11, 0.3)',
    },
    {
      id: 'jovenes',
      title: 'Grupo de Jóvenes',
      description: 'Encuentros juveniles',
      icon: Heart,
      gradient: 'from-neon-500 to-pink-500',
      stats: stats.jovenes,
      glowColor: 'rgba(170, 0, 255, 0.3)',
    },
  ]

  const quickStats = [
    {
      label: 'Total Personas',
      value: totalPersonas,
      icon: Users,
      color: 'electric',
      trend: '+12%',
    },
    {
      label: 'Asistencia Promedio',
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      color: 'neon',
      trend: '+5%',
    },
    {
      label: 'Registros Este Mes',
      value: stats.miembros.lastMonth.length + stats.lideres.lastMonth.length + stats.jovenes.lastMonth.length,
      icon: Calendar,
      color: 'cyber',
      trend: '+8',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-electric-400 via-neon-400 to-cyber-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-400 mt-2 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-electric-500 animate-pulse" />
            Vista general del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-6 py-3 rounded-xl border border-electric-500/20">
            <p className="text-xs text-gray-400 font-medium">Última actualización</p>
            <p className="text-sm font-bold text-electric-400 mt-1">
              {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="card p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-semibold">{stat.trend}</span>
                  <span className="text-xs text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => onNavigate(module.id)}
            className="group card p-6 text-left hover:scale-[1.02] transition-all duration-300 animate-scale-in"
            style={{ 
              animationDelay: `${index * 150}ms`,
            }}
          >
            {/* Icon Header */}
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${module.gradient} shadow-[0_0_30px_${module.glowColor}] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <module.icon className="w-8 h-8 text-white" />
              </div>
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-electric-400 transition-colors transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-200 mb-2 group-hover:text-electric-400 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mb-6">{module.description}</p>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Asistencia</span>
                <span className={`text-2xl font-bold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                  {module.stats.percentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${module.gradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${module.stats.percentage}%`,
                      boxShadow: `0 0 20px ${module.glowColor}`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  <span className="font-semibold text-gray-400">{module.stats.total}</span> personas
                </span>
                <span className="font-medium text-gray-600">
                  {module.stats.lastMonth.length} registros
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-electric-400" />
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('miembros')}
            className="btn-primary py-4 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            <span>Registrar Miembros</span>
          </button>
          <button
            onClick={() => onNavigate('lideres')}
            className="btn-neon py-4 flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5" />
            <span>Registrar Líderes</span>
          </button>
          <button
            onClick={() => onNavigate('jovenes')}
            className="btn-secondary py-4 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            <span>Registrar Jóvenes</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-neon-400" />
            Actividad Reciente
          </h3>
          <span className="text-xs text-gray-500">Últimos 30 días</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay registros recientes</p>
            <p className="text-sm text-gray-500 mt-1">Los registros aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg border border-white/5 hover:border-electric-500/20 transition-colors">
                <div>
                  <p className="text-gray-200 font-medium">{item.tipo || 'Registro'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(item.fecha).toLocaleDateString('es-AR')} • {item.categoria}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-${
                    item.categoria === 'miembros' ? 'emerald' :
                    item.categoria === 'lideres' ? 'amber' : 'neon'
                  }-400 font-bold`}>
                    {item.registros?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">personas</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
