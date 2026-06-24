import { useState, useEffect } from 'react'
import { ClipboardCheck, QrCode, RefreshCw } from 'lucide-react'
import AttendanceList from '../common/AttendanceList'
import AttendanceForm from '../common/AttendanceForm'
import QRScanner from '../common/QRScanner'
import { getPersonas, addPersona, deletePersona, registrarAsistencia } from '../../utils/supabaseStorage'

export default function LideresMinisterio() {
  const [lideres, setLideres] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLider, setNewLider] = useState({ nombre: '', email: '', telefono: '', ministerio: '' })
  const [qrAttendance, setQrAttendance] = useState([])

  useEffect(() => {
    loadLideres()
  }, [])

  const loadLideres = async () => {
    setLoading(true)
    try {
      const data = await getPersonas('lideres')
      setLideres(data)
    } catch (error) {
      console.error('Error al cargar líderes:', error)
      alert('Error al cargar líderes. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLider = async () => {
    if (newLider.nombre && newLider.ministerio) {
      setLoading(true)
      try {
        const resultado = await addPersona('lideres', {
          nombre: newLider.nombre,
          email: newLider.email || null,
          telefono: newLider.telefono || null,
          ministerio: newLider.ministerio,
        })
        
        if (resultado.success) {
          await loadLideres()
          setNewLider({ nombre: '', email: '', telefono: '', ministerio: '' })
          setShowAddModal(false)
          alert('✅ Líder agregado correctamente')
        } else {
          alert(`❌ Error: ${resultado.error}`)
        }
      } catch (error) {
        console.error('Error al agregar líder:', error)
        alert('Error al agregar líder. Ver consola.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteLider = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este líder?')) return
    
    setLoading(true)
    try {
      const resultado = await deletePersona(id)
      
      if (resultado.success) {
        await loadLideres()
        alert('✅ Líder eliminado correctamente')
      } else {
        alert(`❌ Error: ${resultado.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar líder:', error)
      alert('Error al eliminar líder. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttendance = async (attendance) => {
    setLoading(true)
    try {
      const resultado = await registrarAsistencia(
        'lideres',
        selectedDate,
        'Reunión de Líderes',
        attendance
      )
      
      if (resultado.success) {
        alert(`✅ Asistencia registrada: ${attendance.length} líderes`)
        setShowForm(false)
      } else {
        alert(`❌ Error: ${resultado.error}`)
      }
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      alert('Error al guardar asistencia. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = (personId, name) => {
    if (!qrAttendance.find(a => a.id === personId)) {
      setQrAttendance(prev => [...prev, { id: personId, nombre: name, estado: 'presente' }])
    }
  }

  const handleSaveQRAttendance = async () => {
    if (qrAttendance.length > 0) {
      setLoading(true)
      try {
        const resultado = await registrarAsistencia(
          'lideres',
          selectedDate,
          'Reunión de Líderes',
          qrAttendance
        )
        
        if (resultado.success) {
          setQrAttendance([])
          setShowQRScanner(false)
          alert(`✅ Asistencia guardada: ${qrAttendance.length} líderes registrados`)
        } else {
          alert(`❌ Error: ${resultado.error}`)
        }
      } catch (error) {
        console.error('Error al guardar asistencia QR:', error)
        alert('Error al guardar asistencia. Ver consola.')
      } finally {
        setLoading(false)
      }
    }
  }

  const ministerios = [
    'Alabanza',
    'Intercesión',
    'Niños',
    'Jóvenes',
    'Evangelismo',
    'Asistencia Social',
    'Tecnología',
    'Ujieres',
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            Líderes de Ministerio
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Gestión de asistencia a reuniones de liderazgo</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQRScanner(true)}
            className="btn-neon flex items-center space-x-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Escanear QR</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>{showForm ? 'Cancelar' : 'Registrar Asistencia'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 md:p-8 animate-slide-in">
          <h3 className="text-2xl font-display font-bold text-gray-200 mb-6">Nueva Asistencia</h3>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Fecha de Reunión</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto input-field"
            />
          </div>
          <AttendanceForm
            people={lideres}
            onSave={handleSaveAttendance}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card p-8 w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-display font-bold text-gray-200 mb-6">Agregar Líder</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={newLider.nombre}
                  onChange={(e) => setNewLider({ ...newLider, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del líder"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Ministerio</label>
                <select
                  value={newLider.ministerio}
                  onChange={(e) => setNewLider({ ...newLider, ministerio: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar ministerio</option>
                  {ministerios.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddLider}
                disabled={!newLider.nombre || !newLider.ministerio}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewLider({ nombre: '', ministerio: '' })
                }}
                className="px-6 py-3 bg-dark-700/50 text-gray-300 rounded-xl font-medium hover:bg-dark-700 transition-colors border border-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AttendanceList
        people={lideres}
        onAdd={() => setShowAddModal(true)}
        onDelete={handleDeleteLider}
        moduleType="lideres"
        extraColumns={[
          {
            header: 'Ministerio',
            accessor: 'ministerio',
            className: 'hidden md:table-cell',
          },
        ]}
      />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            if (qrAttendance.length > 0) {
              if (confirm(`Tienes ${qrAttendance.length} líderes escaneados. ¿Deseas guardar la asistencia antes de cerrar?`)) {
                handleSaveQRAttendance()
              }
            }
            setShowQRScanner(false)
            setQrAttendance([])
          }}
          category="lideres"
        />
      )}
    </div>
  )
}
