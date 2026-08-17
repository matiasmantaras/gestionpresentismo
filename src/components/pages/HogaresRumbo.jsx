import { useState, useEffect } from 'react'
import { getMiembrosHogar, addMiembroHogar, updateMiembroHogar, deleteMiembroHogar, getEstadisticasHogar } from '../../utils/hogaresStorage'

export default function HogaresRumbo({ user }) {
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMiembro, setEditingMiembro] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadisticas, setEstadisticas] = useState({ totalMiembros: 0, miembrosConTelefono: 0 })
  
  // Form state
  const [formData, setFormData] = useState({
    nombre_miembro: '',
    telefono: '',
  })

  useEffect(() => {
    loadMiembros()
    loadEstadisticas()
  }, [user])

  const loadMiembros = async () => {
    setLoading(true)
    const data = await getMiembrosHogar(user.username)
    setMiembros(data)
    setLoading(false)
  }

  const loadEstadisticas = async () => {
    const stats = await getEstadisticasHogar(user.username)
    setEstadisticas(stats)
  }

  const handleOpenModal = (miembro = null) => {
    if (miembro) {
      setEditingMiembro(miembro)
      setFormData({
        nombre_miembro: miembro.nombre_miembro,
        telefono: miembro.telefono || '',
      })
    } else {
      setEditingMiembro(null)
      setFormData({ nombre_miembro: '', telefono: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMiembro(null)
    setFormData({ nombre_miembro: '', telefono: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre_miembro.trim()) {
      alert('Por favor ingresa el nombre del miembro')
      return
    }

    if (editingMiembro) {
      // Actualizar
      const result = await updateMiembroHogar(editingMiembro.id, formData)
      if (result.success) {
        await loadMiembros()
        await loadEstadisticas()
        handleCloseModal()
      } else {
        alert('Error al actualizar: ' + result.error)
      }
    } else {
      // Agregar nuevo
      const result = await addMiembroHogar(user.username, formData)
      if (result.success) {
        await loadMiembros()
        await loadEstadisticas()
        handleCloseModal()
      } else {
        alert('Error al agregar: ' + result.error)
      }
    }
  }

  const handleDelete = async (miembroId) => {
    if (!confirm('¿Estás seguro de eliminar este miembro?')) return
    
    const result = await deleteMiembroHogar(miembroId)
    if (result.success) {
      await loadMiembros()
      await loadEstadisticas()
    } else {
      alert('Error al eliminar: ' + result.error)
    }
  }

  const filteredMiembros = miembros.filter(m =>
    m.nombre_miembro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.telefono && m.telefono.includes(searchTerm))
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 shadow-[0_8px_32px_0_rgba(236,72,153,0.3)]">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2 drop-shadow-lg">
                Hogar de Rumbo
              </h1>
              <p className="text-purple-100 text-lg">
                Líder: <span className="font-semibold">{user?.nombre}</span>
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Miembros</p>
              <p className="text-3xl font-display font-bold text-white">{estadisticas.totalMiembros}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Con Teléfono</p>
              <p className="text-3xl font-display font-bold text-white">{estadisticas.miembrosConTelefono}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Última Actualización</p>
              <p className="text-lg font-display font-bold text-white">Hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 w-full"
          />
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Miembro</span>
        </button>
      </div>

      {/* Lista de miembros */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredMiembros.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-gray-300 mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No hay miembros registrados'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando miembros a tu hogar de rumbo'}
          </p>
          {!searchTerm && (
            <button onClick={() => handleOpenModal()} className="btn-primary inline-flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Primer Miembro</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMiembros.map((miembro) => (
            <div key={miembro.id} className="card p-6 group hover:shadow-[0_8px_32px_0_rgba(236,72,153,0.2)] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {miembro.nombre_miembro.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">
                      {miembro.nombre_miembro}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(miembro.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {miembro.telefono && (
                <div className="flex items-center space-x-2 text-gray-400 mb-4">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-sm">{miembro.telefono}</span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(miembro)}
                  className="flex-1 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(miembro.id)}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-200">
                {editingMiembro ? 'Editar Miembro' : 'Agregar Miembro'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre_miembro}
                  onChange={(e) => setFormData({ ...formData, nombre_miembro: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: 3764-123456"
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingMiembro ? 'Guardar Cambios' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
