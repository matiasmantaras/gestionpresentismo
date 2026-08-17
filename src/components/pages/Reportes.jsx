import { useState, useEffect, useMemo } from 'react'
import { getModuleReport } from '../../utils/supabaseStorage'

const MONTHS_TO_SHOW = 12

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)

  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const buildMonthOptions = () => {
  const list = []
  const now = new Date()

  for (let i = 0; i < MONTHS_TO_SHOW; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    list.push({
      value: `${year}-${month}`,
      label: formatMonthLabel(`${year}-${month}`),
    })
  }

  return list
}

const normalizeDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export default function Reportes() {
  const [selectedModule, setSelectedModule] = useState('miembros')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  })
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [report, setReport] = useState([])
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const monthOptions = useMemo(() => buildMonthOptions(), [])

  useEffect(() => {
    loadReport()
  }, [selectedModule])

  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    setDateFrom(new Date(year, month - 1, 1).toISOString().slice(0, 10))
    setDateTo(new Date(year, month, 0).toISOString().slice(0, 10))
  }, [selectedMonth])

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

  const buildPeriodStats = (person) => {
    const periodRecords = (person.historial || []).filter((record) => {
      if (!record?.fecha) return false
      const recordDate = normalizeDate(record.fecha)
      const startDate = normalizeDate(dateFrom)
      const endDate = normalizeDate(dateTo)
      return recordDate >= startDate && recordDate <= endDate
    })

    const totals = {
      totalEventos: periodRecords.length,
      totalPresente: 0,
      totalAusente: 0,
      totalJustificado: 0,
    }

    periodRecords.forEach((record) => {
      if (record.estado === 'presente') totals.totalPresente += 1
      else if (record.estado === 'ausente') totals.totalAusente += 1
      else if (record.estado === 'justificado') totals.totalJustificado += 1
    })

    totals.porcentajeAsistencia = totals.totalEventos > 0
      ? Math.round((totals.totalPresente / totals.totalEventos) * 100)
      : 0

    const lastRecord = [...periodRecords].sort((a, b) => normalizeDate(b.fecha) - normalizeDate(a.fecha))[0]

    return {
      ...person,
      ...totals,
      historial: periodRecords,
      ultimaAsistencia: lastRecord ? lastRecord.fecha : null,
      estadoPrincipal: totals.totalPresente >= totals.totalAusente && totals.totalPresente >= totals.totalJustificado ? 'presente' : totals.totalAusente >= totals.totalJustificado ? 'ausente' : 'justificado',
    }
  }

  const monthlyReport = useMemo(() => {
    return report
      .map(buildPeriodStats)
      .filter((person) => person.totalEventos > 0)
      .sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia || a.nombre.localeCompare(b.nombre))
  }, [report, dateFrom, dateTo])

  const filteredReport = monthlyReport.filter((person) => {
    const matchesSearch = person.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || person[selectedStatus] > 0
    return matchesSearch && matchesStatus
  })

  const summaryStats = useMemo(() => {
    const totalPersonas = filteredReport.length
    const totalEventos = filteredReport.reduce((sum, person) => sum + person.totalEventos, 0)
    const totalPresentes = filteredReport.reduce((sum, person) => sum + person.totalPresente, 0)
    const totalAusentes = filteredReport.reduce((sum, person) => sum + person.totalAusente, 0)
    const totalJustificados = filteredReport.reduce((sum, person) => sum + person.totalJustificado, 0)
    const promedioAsistencia = totalPersonas > 0
      ? Math.round(filteredReport.reduce((sum, person) => sum + person.porcentajeAsistencia, 0) / totalPersonas)
      : 0
    const mejorAsistencia = filteredReport.length > 0
      ? filteredReport.reduce((best, person) => person.porcentajeAsistencia > best.porcentajeAsistencia ? person : best, filteredReport[0])
      : null

    return {
      totalPersonas,
      totalEventos,
      totalPresentes,
      totalAusentes,
      totalJustificados,
      promedioAsistencia,
      mejorAsistencia,
    }
  }, [filteredReport])

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

  const handleExportCsv = () => {
    if (!filteredReport.length) return

    const headers = ['Nombre', 'Ministerio', 'Eventos', 'Presente', 'Ausente', 'Justificado', '% Asistencia', 'Ultima Asistencia']
    const rows = filteredReport.map((person) => [
      person.nombre,
      person.ministerio || 'General',
      person.totalEventos,
      person.totalPresente,
      person.totalAusente,
      person.totalJustificado,
      `${person.porcentajeAsistencia}%`,
      person.ultimaAsistencia ? new Date(normalizeDate(person.ultimaAsistencia)).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) : 'Sin registros',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-${selectedModule}-${dateFrom}-a-${dateTo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Reportes de Asistencia
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Resumen mensual por persona y módulo
        </p>
      </div>

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

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="totalPresente">Presentes</option>
              <option value="totalAusente">Ausentes</option>
              <option value="totalJustificado">Justificados</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExportCsv}
            disabled={!filteredReport.length}
            className="w-full md:w-auto px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Exportar CSV
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="card p-12 text-center">
          <div className="inline-block p-6 bg-dark-700/30 rounded-2xl mb-4 border border-white/5">
            <div className="animate-spin w-20 h-20 border-4 border-electric-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h4 className="text-xl font-bold text-gray-300 mb-2">Cargando reportes...</h4>
          <p className="text-gray-500">Obteniendo información del mes seleccionado</p>
        </div>
      ) : filteredReport.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-block p-6 bg-dark-700/30 rounded-2xl mb-4 border border-white/5">
            <svg className="w-20 h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-gray-300 mb-2">No hay datos para este mes</h4>
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron resultados para la búsqueda actual.' : 'Todavía no hay registros de asistencia para este mes.'}
          </p>
        </div>
      ) : (
        <div className="card p-6 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-display font-bold text-gray-200">
                Planilla del período · {new Date(dateFrom + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} a {new Date(dateTo + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Exportable a Excel / CSV para revisión del período seleccionado
              </p>
            </div>
          </div>

          <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-bold text-electric-400 bg-dark-700/60 rounded-l-xl">Nombre</th>
                <th className="text-left py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Ministerio</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Eventos</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Presente</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Ausente</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Justificado</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">% Asistencia</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60">Última asistencia</th>
                <th className="text-center py-3 px-4 font-bold text-electric-400 bg-dark-700/60 rounded-r-xl">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((person) => (
                <tr key={person.id} className="bg-dark-700/25 hover:bg-dark-700/40 transition-colors">
                  <td className="py-4 px-4 rounded-l-xl border-l border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-electric-500 to-neon-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(0,128,255,0.4)]">
                        {person.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">{person.nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-300 border-r border-white/5">
                    {person.ministerio || 'General'}
                  </td>
                  <td className="py-4 px-4 text-center border-r border-white/5">
                    <span className="inline-block min-w-[42px] px-2.5 py-1 bg-dark-800/80 text-gray-200 rounded-lg font-semibold border border-white/10">
                      {person.totalEventos}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center border-r border-white/5">
                    <span className="inline-block min-w-[42px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-semibold border border-emerald-500/20">
                      {person.totalPresente}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center border-r border-white/5">
                    <span className="inline-block min-w-[42px] px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg font-semibold border border-red-500/20">
                      {person.totalAusente}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center border-r border-white/5">
                    <span className="inline-block min-w-[42px] px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg font-semibold border border-amber-500/20">
                      {person.totalJustificado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center border-r border-white/5">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-20 h-2 bg-dark-800 rounded-full overflow-hidden">
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
                  <td className="py-4 px-4 text-center text-gray-300 border-r border-white/5">
                    {person.ultimaAsistencia
                      ? new Date(normalizeDate(person.ultimaAsistencia)).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="py-4 px-4 text-center rounded-r-xl">
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="px-3 py-2 bg-gradient-to-r from-electric-500 to-neon-600 text-white rounded-lg font-medium hover:from-electric-600 hover:to-neon-700 transition-all shadow-[0_0_15px_rgba(0,128,255,0.3)]"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPerson && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-200 mb-2">
                  Historial de {selectedPerson.nombre}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-dark-700/50 text-gray-300 rounded-lg text-sm font-medium border border-white/10">
                    {selectedPerson.totalEventos} eventos del mes
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

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-200 mb-4">Detalle del mes</h4>
              {selectedPerson.historial.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay registros de asistencia para esta persona en {formatMonthLabel(selectedMonth)}
                </div>
              ) : (
                selectedPerson.historial.map((record, index) => (
                  <div
                    key={`${record.fecha}-${index}`}
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
                          {new Date(normalizeDate(record.fecha)).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
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
