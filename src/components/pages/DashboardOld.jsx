import { useEffect, useState } from 'react'
import { getAttendanceStats } from '../../utils/storage'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    miembros: { total: 0, percentage: 0, lastMonth: [] },
    lideres: { total: 0, percentage: 0, lastMonth: [] },
    jovenes: { total: 0, percentage: 0, lastMonth: [] },
  })

  useEffect(() => {
    const loadedStats = getAttendanceStats()
    setStats(loadedStats)
  }, [])

  const modules = [
    {
      id: 'miembros',
      title: 'Miembros Generales',
      description: 'Asistencia a cultos regulares',
      icon: 'users',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      stats: stats.miembros,
    },
    {
      id: 'lideres',
      title: 'Líderes de Ministerio',
      description: 'Reuniones de liderazgo',
      icon: 'star',
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      stats: stats.lideres,
    },
    {
      id: 'jovenes',
      title: 'Grupo de Jóvenes',
      description: 'Encuentros juveniles',
      icon: 'heart',
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-50',
      stats: stats.jovenes,
    },
  ]

  const icons = {
    users: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    star: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    heart: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-700 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Vista general del sistema de presentismo</p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-soft px-6 py-4 border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Última actualización</p>
            <p className="text-xl font-bold text-primary-700 mt-1">
              {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <button
            key={module.id}
            onClick={() => onNavigate(module.id)}
            className="group relative bg-white rounded-2xl shadow-soft hover:shadow-hover transition-all duration-300 p-6 text-left overflow-hidden transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${module.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${module.gradient} text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {icons[module.icon]}
                </div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">
                {module.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{module.description}</p>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Asistencia promedio</span>
                  <span className={`text-3xl font-bold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                    {module.stats.percentage}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${module.gradient} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                      style={{ width: `${module.stats.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">{module.stats.total}</span> personas registradas
                  </span>
                  <span className="font-medium text-gray-600">
                    {module.stats.lastMonth.length} registros
                  </span>
                </div>
              </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-2 border-transparent group-hover:border-current rounded-2xl transition-colors duration-300 bg-gradient-to-r ${module.gradient} bg-clip-text`}></div>
          </button>
        ))}
      </div>

      {/* Trend Section */}
      <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-display font-bold text-gray-800">Tendencia Mensual</h3>
            <p className="text-gray-500 mt-1">Comparativa de asistencia por módulo</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg border border-primary-200">
            <p className="text-sm font-semibold text-primary-700">Último mes</p>
          </div>
        </div>

        <div className="space-y-6">
          {modules.map((module, index) => (
            <div key={module.id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${module.gradient}`}></div>
                  <span className="text-sm font-semibold text-gray-700">{module.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{module.stats.lastMonth.length} registros</span>
                  <span className={`text-lg font-bold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                    {module.stats.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${module.gradient} rounded-full transition-all duration-1000 ease-out shadow-inner`}
                    style={{ width: `${module.stats.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Box */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Registrados</p>
            <p className="text-2xl font-bold text-primary-700">
              {stats.miembros.total + stats.lideres.total + stats.jovenes.total}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Promedio General</p>
            <p className="text-2xl font-bold text-emerald-700">
              {Math.round((stats.miembros.percentage + stats.lideres.percentage + stats.jovenes.percentage) / 3)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Eventos</p>
            <p className="text-2xl font-bold text-amber-700">
              {stats.miembros.lastMonth.length + stats.lideres.lastMonth.length + stats.jovenes.lastMonth.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
