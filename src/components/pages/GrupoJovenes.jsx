import { useState, useEffect } from 'react'
import { ClipboardCheck, QrCode, RefreshCw } from 'lucide-react'
import AttendanceList from '../common/AttendanceList'
import AttendanceForm from '../common/AttendanceForm'
import QRScanner from '../common/QRScanner'
import { getPersonas, addPersona, deletePersona, registrarAsistencia } from '../../utils/supabaseStorage'

export default function GrupoJovenes() {
  const [jovenes, setJovenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEncuentro, setSelectedEncuentro] = useState('reunion-semanal')
  const [qrAttendance, setQrAttendance] = useState([])

  useEffect(() => {
    loadJovenes()
  }, [])

  const loadJovenes = async () => {
    setLoading(true)
    try {
      const data = await getPersonas('jovenes')
      setJovenes(data)
    } catch (error) {
      console.error('Error al cargar jóvenes:', error)
      alert('Error al cargar jóvenes. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddJoven = async (nombre, email, telefono) => {
    setLoading(true)
    try {
      const resultado = await addPersona('jovenes', {
        nombre,
        email: email || null,
        telefono: telefono || null,
      })
      
      if (resultado.success) {
        await loadJovenes()
        alert('✅ Joven agregado correctamente')
      } else {
        alert(`❌ Error: ${resultado.error}`)
      }
    } catch (error) {
      console.error('Error al agregar joven:', error)
      alert('Error al agregar persona. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJoven = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta persona?')) return
    
    setLoading(true)
    try {
      const resultado = await deletePersona(id)
      
      if (resultado.success) {
        await loadJovenes()
        alert('✅ Persona eliminada correctamente')
      } else {
        alert(`❌ Error: ${resultado.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar joven:', error)
      alert('Error al eliminar persona. Ver consola.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttendance = async (attendance) => {
    setLoading(true)
    try {
      const resultado = await registrarAsistencia(
        'jovenes',
        selectedDate,
        selectedEncuentro,
        attendance
      )
      
      if (resultado.success) {
        alert(`✅ Asistencia registrada: ${attendance.length} jóvenes`)
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
          'jovenes',
          selectedDate,
          selectedEncuentro,
          qrAttendance
        )
        
        if (resultado.success) {
          setQrAttendance([])
          setShowQRScanner(false)
          alert(`✅ Asistencia guardada: ${qrAttendance.length} jóvenes registrados`)
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

  if (loading && jovenes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-300">Cargando jóvenes...</p>
        </div>
      </div>
    )
  }

  const encuentroTypes = [
    { value: 'reunion-semanal', label: 'Reunión Semanal' },
    { value: 'actividad-especial', label: 'Actividad Especial' },
    { value: 'retiro', label: 'Retiro' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
            Grupo de Jóvenes
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Gestión de asistencia a encuentros juveniles</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Encuentro</label>
              <select
                value={selectedEncuentro}
                onChange={(e) => setSelectedEncuentro(e.target.value)}
                className="input-field"
              >
                {encuentroTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <AttendanceForm
            people={jovenes}
            onSave={handleSaveAttendance}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <AttendanceList
        people={jovenes}
        onAdd={handleAddJoven}
        onDelete={handleDeleteJoven}
        moduleType="jovenes"
      />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            if (qrAttendance.length > 0) {
              if (confirm(`Tienes ${qrAttendance.length} jóvenes escaneados. ¿Deseas guardar la asistencia antes de cerrar?`)) {
                handleSaveQRAttendance()
              }
            }
            setShowQRScanner(false)
            setQrAttendance([])
          }}
          category="jovenes"
        />
      )}
    </div>
  )
}
