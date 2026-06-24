import { useState } from 'react'
import { Trash2, QrCode, UserPlus, Search } from 'lucide-react'
import PersonQRCode from './PersonQRCode'

export default function AttendanceList({ people, onAdd, onDelete, moduleType, extraColumns = [] }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPerson, setNewPerson] = useState({ nombre: '', email: '', telefono: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPersonForQR, setSelectedPersonForQR] = useState(null)

  const handleAdd = () => {
    if (newPerson.nombre.trim()) {
      onAdd(newPerson.nombre.trim(), newPerson.email.trim(), newPerson.telefono.trim())
      setNewPerson({ nombre: '', email: '', telefono: '' })
      setShowAddModal(false)
    }
  }

  const filteredPeople = people.filter((person) =>
    person.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="card p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-display font-bold text-gray-200 flex items-center gap-3">
            Lista de Personas
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-electric-500 to-neon-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(0,128,255,0.3)]">
              {people.length}
            </span>
          </h3>
          <p className="text-gray-400 mt-1">
            Gestiona las personas registradas en el sistema
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold
                   hover:from-green-600 hover:to-emerald-700 transition-all duration-200 
                   shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]
                   transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 justify-center"
        >
          <UserPlus className="w-5 h-5" />
          <span>Agregar Persona</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Content */}
      {filteredPeople.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block p-6 bg-dark-700/30 rounded-2xl mb-4 border border-white/5">
            <svg className="w-20 h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-gray-300 mb-2">No hay personas registradas</h4>
          <p className="text-gray-500 mb-6">Comienza agregando personas para gestionar su asistencia</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-electric-500 to-neon-500 text-white rounded-xl font-medium hover:from-electric-600 hover:to-neon-600 transition-colors shadow-[0_0_20px_rgba(0,128,255,0.3)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Agregar Primera Persona</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-white/10">
          <table className="w-full">
            <thead className="bg-dark-700/50 border-b-2 border-white/10">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-electric-400">Nombre</th>
                {extraColumns.map((col, idx) => (
                  <th key={idx} className={`text-left py-4 px-6 font-bold text-electric-400 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                <th className="text-left py-4 px-6 font-bold text-electric-400 hidden md:table-cell">
                  Fecha de Registro
                </th>
                <th className="text-right py-4 px-6 font-bold text-electric-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPeople.map((person, index) => (
                <tr
                  key={person.id}
                  className="hover:bg-electric-500/5 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-600 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(0,128,255,0.4)]">
                        {person.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-200">{person.nombre}</span>
                    </div>
                  </td>
                  {extraColumns.map((col, idx) => (
                    <td key={idx} className={`py-4 px-6 ${col.className || ''}`}>
                      <span className="inline-block px-3 py-1 text-sm font-semibold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                        {person[col.accessor]}
                      </span>
                    </td>
                  ))}
                  <td className="py-4 px-6 text-sm text-gray-400 hidden md:table-cell">
                    {new Date(person.fechaRegistro).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPersonForQR(person)}
                        className="p-2.5 text-electric-400 hover:bg-electric-500/10 rounded-lg transition-all duration-200 transform hover:scale-110 group-hover:opacity-100 opacity-70 border border-transparent hover:border-electric-500/30"
                        title="Ver código QR"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar a ${person.nombre}?`)) {
                            onDelete(person.id)
                          }
                        }}
                        className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:scale-110 group-hover:opacity-100 opacity-70 border border-transparent hover:border-red-500/30"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card p-8 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-gray-200">Agregar Persona</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewPerson({ nombre: '', email: '', telefono: '' })
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={newPerson.nombre}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, nombre: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Ingrese el nombre..."
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="ejemplo@email.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={newPerson.telefono}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, telefono: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="1234567890"
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={!newPerson.nombre.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewPerson({ nombre: '', email: '', telefono: '' })
                }}
                className="px-6 py-3 bg-dark-700/50 text-gray-300 rounded-xl font-medium hover:bg-dark-700 transition-colors border border-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedPersonForQR && (
        <PersonQRCode
          person={selectedPersonForQR}
          category={moduleType}
          onClose={() => setSelectedPersonForQR(null)}
        />
      )}
    </div>
  )
}
