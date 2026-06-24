import { QRCodeSVG } from 'qrcode.react'
import { Download, X } from 'lucide-react'

export default function PersonQRCode({ person, category, onClose }) {
  const qrData = JSON.stringify({
    personId: person.id,
    name: person.nombre,
    category: category,
    generatedAt: new Date().toISOString(),
  })

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 400
    canvas.height = 500

    img.onload = () => {
      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 500)

      // Dibujar QR
      ctx.drawImage(img, 50, 50, 300, 300)

      // Agregar texto
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 24px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(person.nombre, 200, 380)

      ctx.font = '16px Inter'
      ctx.fillStyle = '#6b7280'
      const categoryNames = {
        miembros: 'Miembro General',
        lideres: 'Líder de Ministerio',
        jovenes: 'Grupo de Jóvenes',
      }
      ctx.fillText(categoryNames[category] || category, 200, 410)

      // Descargar
      const link = document.createElement('a')
      link.download = `QR-${person.nombre.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card p-8 w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display font-bold text-gray-200">Código QR</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="text-center">
          <div className="bg-white p-6 rounded-2xl border-4 border-electric-500/20 mb-4 inline-block">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-200 mb-1">{person.nombre}</h4>
            <p className="text-sm text-gray-400">
              {category === 'miembros' && 'Miembro General'}
              {category === 'lideres' && 'Líder de Ministerio'}
              {category === 'jovenes' && 'Grupo de Jóvenes'}
            </p>
          </div>

          <div className="bg-electric-500/10 rounded-xl p-4 mb-6 border-2 border-electric-500/20">
            <p className="text-sm text-gray-300 leading-relaxed">
              Este código QR permite registrar la asistencia de manera rápida. 
              Escanéalo al ingresar a la actividad.
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Descargar QR</span>
          </button>
        </div>
      </div>
    </div>
  )
}
