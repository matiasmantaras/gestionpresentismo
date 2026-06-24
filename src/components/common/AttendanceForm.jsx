import { useState } from 'react'

export default function AttendanceForm({ people, onSave, onCancel }) {
  const [attendance, setAttendance] = useState(
    people.map((person) => ({
      id: person.id,
      nombre: person.nombre,
      estado: 'presente',
    }))
  )
  const [searchTerm, setSearchTerm] = useState('')

  const handleStatusChange = (id, estado) => {
    setAttendance(attendance.map((a) => (a.id === id ? { ...a, estado } : a)))
  }

  const handleSave = () => {
    onSave(attendance)
  }

  const filteredAttendance = attendance.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'presente':
        return 'bg-emerald-500'
      case 'ausente':
        return 'bg-red-500'
      case 'justificado':
        return 'bg-amber-500'
      default:
        return 'bg-gray-500'
    }
  }

  const stats = {
    presente: attendance.filter((a) => a.estado === 'presente').length,
    ausente: attendance.filter((a) => a.estado === 'ausente').length,
    justificado: attendance.filter((a) => a.estado === 'justificado').length,
  }

  const percentage = people.length > 0 ? Math.round((stats.presente / people.length) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-2 border-emerald-500/20 hover:border-emerald-500/40 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-emerald-400 font-semibold">Presentes</p>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.presente}</p>
          <p className="text-xs text-gray-400 mt-1">{percentage}% del total</p>
        </div>
        <div className="card p-5 border-2 border-red-500/20 hover:border-red-500/40 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-400 font-semibold">Ausentes</p>
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.ausente}</p>
        </div>
        <div className="card p-5 border-2 border-amber-500/20 hover:border-amber-500/40 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-400 font-semibold">Justificados</p>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats.justificado}</p>
        </div>
        <div className="card p-5 border-2 border-electric-500/20">
          <p className="text-sm text-electric-400 font-semibold mb-2">Total</p>
          <p className="text-3xl font-bold text-electric-400">{people.length}</p>
          <p className="text-xs text-gray-400 mt-1">personas</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar persona por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Attendance List */}
      <div className="card p-4 max-h-[500px] overflow-y-auto">
        <div className="space-y-2">
          {filteredAttendance.map((person, index) => (
            <div
              key={person.id}
              className="group relative bg-dark-700/30 hover:bg-electric-500/5 rounded-xl p-4 border border-white/5 hover:border-electric-500/30 transition-all duration-200"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(person.estado)} shadow-lg`} />
                  <span className="font-semibold text-gray-200 truncate">{person.nombre}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStatusChange(person.id, 'presente')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      person.estado === 'presente'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-dark-700 text-gray-400 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    ✓ Presente
                  </button>
                  <button
                    onClick={() => handleStatusChange(person.id, 'ausente')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      person.estado === 'ausente'
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'bg-dark-700 text-gray-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30'
                    }`}
                  >
                    ✕ Ausente
                  </button>
                  <button
                    onClick={() => handleStatusChange(person.id, 'justificado')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                      person.estado === 'justificado'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-dark-700 text-gray-400 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    ⓘ Justificado
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 btn-primary flex items-center justify-center space-x-2 py-4"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Guardar Asistencia</span>
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-4 bg-dark-700/50 text-gray-300 rounded-xl font-medium hover:bg-dark-700 transition-all duration-200 border border-white/10"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
