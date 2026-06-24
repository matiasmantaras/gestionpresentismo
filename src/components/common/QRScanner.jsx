import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { getPersonaByQR, registrarAsistenciaIndividual } from '../../utils/supabaseStorage'

export default function QRScanner({ onScan, onClose, category, tipoEvento = 'Asistencia General' }) {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(true)
  const [lastScan, setLastScan] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      async (decodedText) => {
        if (processing) return // Evitar múltiples escaneos simultáneos
        
        setProcessing(true)
        try {
          // Buscar persona en la base de datos por su QR code
          const persona = await getPersonaByQR(decodedText)
          
          if (!persona) {
            setLastScan({ success: false, message: 'QR no encontrado en la base de datos' })
            setTimeout(() => setLastScan(null), 3000)
            setProcessing(false)
            return
          }
          
          // Verificar que sea de la categoría correcta
          if (persona.categoria !== category) {
            setLastScan({ 
              success: false, 
              message: `QR de "${persona.categoria}" no válido para "${category}"` 
            })
            setTimeout(() => setLastScan(null), 3000)
            setProcessing(false)
            return
          }
          
          // Registrar asistencia automáticamente en Supabase
          const resultado = await registrarAsistenciaIndividual(
            persona.id,
            persona.categoria,
            tipoEvento
          )
          
          if (resultado.success) {
            setLastScan({ success: true, name: persona.nombre, id: persona.id })
            setScanHistory(prev => [
              ...prev, 
              { name: persona.nombre, timestamp: new Date(), success: true }
            ])
            
            // Notificar al componente padre si existe callback
            if (onScan) onScan(persona.id, persona.nombre)
            
            // Auto-cerrar mensaje después de 2 segundos
            setTimeout(() => setLastScan(null), 2000)
          } else {
            // Manejar caso de duplicado
            if (resultado.error?.includes('duplicado') || resultado.error?.includes('Ya existe')) {
              setLastScan({ 
                success: false, 
                message: `${persona.nombre} ya fue registrado hoy`,
                isDuplicate: true
              })
            } else {
              setLastScan({ success: false, message: resultado.error || 'Error al registrar' })
            }
            setTimeout(() => setLastScan(null), 3000)
          }
        } catch (error) {
          console.error('Error al procesar QR:', error)
          setLastScan({ success: false, message: 'Error al procesar el código QR' })
          setTimeout(() => setLastScan(null), 3000)
        } finally {
          setProcessing(false)
        }
      },
      (error) => {
        // Ignorar errores de escaneo continuo
        console.debug('Escaneando...', error)
      }
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(console.error)
    }
  }, [category, onScan])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-electric-500 to-neon-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Escanear Código QR</h3>
                <p className="text-white/80 text-sm">Apunta la cámara al código QR</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scanner */}
        <div className="p-6">
          <div id="qr-reader" className="rounded-xl overflow-hidden shadow-lg"></div>

          {/* Processing Indicator */}
          {processing && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="font-semibold text-blue-800">Verificando en la base de datos...</p>
            </div>
          )}

          {/* Scan Result */}
          {lastScan && !processing && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-center space-x-3 animate-slide-in ${
                lastScan.success
                  ? 'bg-green-50 border-2 border-green-200'
                  : lastScan.isDuplicate
                  ? 'bg-amber-50 border-2 border-amber-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              {lastScan.success ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">¡Asistencia registrada en BD!</p>
                    <p className="text-sm text-green-600">{lastScan.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className={`w-6 h-6 shrink-0 ${
                    lastScan.isDuplicate ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <div>
                    <p className={`font-semibold ${
                      lastScan.isDuplicate ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {lastScan.isDuplicate ? 'Registro duplicado' : 'Error al escanear'}
                    </p>
                    <p className={`text-sm ${
                      lastScan.isDuplicate ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {lastScan.message}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
                  {scanHistory.length}
                </span>
                Escaneados en esta sesión
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {scanHistory.slice(-5).reverse().map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">{scan.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(scan.timestamp).toLocaleTimeString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Cámara activa</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cerrar escáner
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
