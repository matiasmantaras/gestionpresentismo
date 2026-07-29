import { useState, useEffect } from 'react'
import { getModuleReport } from '../../utils/supabaseStorage'

export default function Reportes() {
  const [selectedModule, setSelectedModule] = useState('miembros')
  const [report, setReport] = useState([])
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReport()
  }, [selectedModule])

  const loadReport = async () => {
    setLoading(true)
    try {
      const data = await getModuleReport(selectedModule)
      setReport(data)
    } catch (error) {
      console.error('Error al cargar reporte:', error)
      setReport([])
    } finally {
      setLoading(false)
    }
  }

  const filteredReport = report.filter((person) =>
    person.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'ausente':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'justificado':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'presente':
        return '✓'
      case 'ausente':
        return '✕'
      case 'justificado':
        return 'ⓘ'
      default:
        return '?'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Reportes de Asistencia
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Historial y estadísticas de asistencia por persona
        </p>
      </div>

      {/* Module Selector */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">Seleccionar Módulo</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedModule('miembros')}
            className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
              selectedModule === 'miembros'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-dark-700/30 border-white/10 text-gray-400 hover:border-emerald-500/50'
            }`}
          >
            Miembros Generales
          </button>
          <button
            onClick={() => setSelectedModule('lideres')}
            className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
              selectedModule === 'lideres'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-dark-700/30 border-white/10 text-gray-400 hover:border-amber-500/50'
            }`}
          >
            Líderes de Ministerio
          </button>
          <button
            onClick={() => setSelectedModule('jovenes')}
            className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
              selectedModule === 'jovenes'
                ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                : 'bg-dark-700/30 border-white/10 text-gray-400 hover:border-pink-500/50'
            }`}
          >
            Grupo de Jóvenes
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block p-6 bg-dark-700/30 rounded-2xl mb-4 border border-white/5">
            <div className="animate-spin w-20 h-20 border-4 border-electric-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h4 className="text-xl font-bold text-gray-300 mb-2">Cargando reportes...</h4>
          <p className="text-gray-500">Obteniendo datos de la base de datos</p>
        </div>
      ) : filteredReport.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-block p-6 bg-dark-700/30 rounded-2xl mb-4 border border-white/5">
            <svg className="w-20 h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-gray-300 mb-2">No hay datos disponibles</h4>
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Aún no hay personas registradas en este módulo'}
          </p>
        </div>
      ) : (
        <div className="card p-6 overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-white/10">
              <tr>
                <th className="text-left py-4 px-4 font-bold text-electric-400">Nombre</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">Total Eventos</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">Presentes</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">Ausentes</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">Justificados</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">% Asistencia</th>
                <th className="text-center py-4 px-4 font-bold text-electric-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReport.map((person) => (
                <tr key={person.id} className="hover:bg-electric-500/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-600 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(0,128,255,0.4)]">
                        {person.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">{person.nombre}</div>
                        {person.ministerio && (
                          <div className="text-xs text-amber-400">{person.ministerio}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-dark-700/50 text-gray-300 rounded-lg font-semibold border border-white/10">
                      {person.totalEventos}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-semibold border border-emerald-500/20">
                      {person.totalPresente}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-red-500/10 text-red-400 rounded-lg font-semibold border border-red-500/20">
                      {person.totalAusente}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg font-semibold border border-amber-500/20">
                      {person.totalJustificado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                          style={{ width: `${person.porcentajeAsistencia}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-emerald-400 min-w-[45px]">
                        {person.porcentajeAsistencia}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="px-4 py-2 bg-gradient-to-r from-electric-500 to-neon-600 text-white rounded-lg font-medium hover:from-electric-600 hover:to-neon-700 transition-all shadow-[0_0_15px_rgba(0,128,255,0.3)] hover:shadow-[0_0_25px_rgba(0,128,255,0.5)]"
                    >
                      Ver Historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-200 mb-2">
                  Historial de {selectedPerson.nombre}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-dark-700/50 text-gray-300 rounded-lg text-sm font-medium border border-white/10">
                    {selectedPerson.totalEventos} eventos totales
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-500/20">
                    {selectedPerson.totalPresente} presentes
                  </span>
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm font-semibold border border-red-500/20">
                    {selectedPerson.totalAusente} ausentes
                  </span>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-semibold border border-amber-500/20">
                    {selectedPerson.totalJustificado} justificados
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Bar */}
            <div className="mb-6 p-5 bg-gradient-to-r from-electric-500/10 to-neon-500/10 rounded-xl border border-electric-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">Porcentaje de Asistencia</span>
                <span className="text-2xl font-bold text-emerald-400">{selectedPerson.porcentajeAsistencia}%</span>
              </div>
              <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                  style={{ width: `${selectedPerson.porcentajeAsistencia}%` }}
                />
              </div>
            </div>

            {/* History Timeline */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-200 mb-4">Historial de Eventos</h4>
              {selectedPerson.historial.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay registros de asistencia para esta persona
                </div>
              ) : (
                selectedPerson.historial.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-dark-700/30 rounded-xl border border-white/5 hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        record.estado === 'presente' ? 'bg-emerald-500/20 text-emerald-400' :
                        record.estado === 'ausente' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {getStatusIcon(record.estado)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">
                          {new Date(record.fecha).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {record.tipo && record.tipo !== 'N/A' && (
                          <div className="text-sm text-gray-400">{record.tipo}</div>
                        )}
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(record.estado)}`}>
                      {record.estado.charAt(0).toUpperCase() + record.estado.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Close Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-6 py-3 bg-dark-700/50 text-gray-300 rounded-xl font-medium hover:bg-dark-700 transition-colors border border-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
