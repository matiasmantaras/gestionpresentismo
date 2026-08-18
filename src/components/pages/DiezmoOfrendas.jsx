import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'diezmo_ofrendas_entries'

const INITIAL_FORM = {
  nombre: '',
  apellido: '',
  tipo: 'Diezmo',
  monto: '',
  metodo: 'Efectivo',
  fecha: new Date().toISOString().slice(0, 10),
}

const readEntries = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error al leer Diezmo y Ofrendas:', error)
    return []
  }
}

const writeEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export default function DiezmoOfrendas() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEntries(readEntries())
    setLoading(false)
  }, [])

  const totals = useMemo(() => {
    const total = entries.reduce((sum, item) => sum + Number(item.monto || 0), 0)
    const diezmos = entries.filter((item) => item.tipo === 'Diezmo').reduce((sum, item) => sum + Number(item.monto || 0), 0)
    const ofrendas = entries.filter((item) => item.tipo === 'Ofrenda').reduce((sum, item) => sum + Number(item.monto || 0), 0)

    const sabado = entries
      .filter((item) => item.tipo === 'Ofrenda' && new Date(`${item.fecha}T00:00:00`).getDay() === 6)
      .reduce((sum, item) => sum + Number(item.monto || 0), 0)

    const domingo = entries
      .filter((item) => item.tipo === 'Ofrenda' && new Date(`${item.fecha}T00:00:00`).getDay() === 0)
      .reduce((sum, item) => sum + Number(item.monto || 0), 0)

    return { total, diezmos, ofrendas, sabado, domingo }
  }, [entries])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.monto || !form.fecha) {
      setError('Completa el monto y la fecha.')
      return
    }

    if (form.tipo === 'Diezmo' && (!form.nombre || !form.apellido)) {
      setError('Para el diezmo, completá nombre y apellido.')
      return
    }

    setSubmitting(true)
    setError('')

    const nextEntry = {
      id: Date.now(),
      nombre: form.nombre || 'Ofrenda',
      apellido: form.apellido || (form.tipo === 'Ofrenda' ? (new Date(`${form.fecha}T00:00:00`).getDay() === 6 ? 'Sábado' : 'Domingo') : ''),
      tipo: form.tipo,
      monto: Number(form.monto),
      metodo: form.metodo,
      fecha: form.fecha,
    }

    const updatedEntries = [nextEntry, ...readEntries()]
    writeEntries(updatedEntries)
    setEntries(updatedEntries)
    setForm(INITIAL_FORM)
    setSubmitting(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-amber-400 to-emerald-500 bg-clip-text text-transparent">
          Diezmo y Ofrendas
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Registro exclusivo para el área de Diezmo y Ofrendas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card p-5 border border-amber-500/20">
          <p className="text-sm text-amber-400 font-semibold">Total general</p>
          <p className="text-3xl font-bold text-white mt-2">${totals.total.toLocaleString('es-AR')}</p>
        </div>
        <div className="card p-5 border border-emerald-500/20">
          <p className="text-sm text-emerald-400 font-semibold">Diezmos</p>
          <p className="text-3xl font-bold text-white mt-2">${totals.diezmos.toLocaleString('es-AR')}</p>
        </div>
        <div className="card p-5 border border-cyan-500/20">
          <p className="text-sm text-cyan-400 font-semibold">Ofrendas</p>
          <p className="text-3xl font-bold text-white mt-2">${totals.ofrendas.toLocaleString('es-AR')}</p>
        </div>
        <div className="card p-5 border border-fuchsia-500/20">
          <p className="text-sm text-fuchsia-400 font-semibold">Ofrenda Sábado/Domingo</p>
          <p className="text-xl font-bold text-white mt-2">S: ${totals.sabado.toLocaleString('es-AR')} / D: ${totals.domingo.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-2xl font-display font-bold text-gray-200 mb-5">Registrar ingreso</h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder={form.tipo === 'Diezmo' ? 'Ej: Juan' : 'Ej: Ofrenda'}
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder={form.tipo === 'Diezmo' ? 'Ej: Pérez' : 'Ej: Domingo'}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
              <option value="Diezmo">Diezmo</option>
              <option value="Ofrenda">Ofrenda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Monto</label>
            <input
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              placeholder="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Fecha</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input-field" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Método</label>
            <select name="metodo" value={form.metodo} onChange={handleChange} className="input-field">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Mercado pago">Mercado pago</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="md:col-span-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : 'Guardar ingreso'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-2xl font-display font-bold text-gray-200 mb-5">Historial de ingresos</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">Cargando registros...</div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-xl font-semibold text-white">No hay registros aún</p>
            <p className="text-gray-400 mt-2">Comenzá cargando el primer diezmo u ofrenda para ver el historial.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-bold text-amber-400 bg-dark-700/60 rounded-l-xl">Nombre y apellido</th>
                  <th className="text-left py-3 px-4 font-bold text-amber-400 bg-dark-700/60">Tipo</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-400 bg-dark-700/60">Monto</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-400 bg-dark-700/60">Método</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-400 bg-dark-700/60 rounded-r-xl">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="bg-dark-700/25 hover:bg-dark-700/40 transition-colors">
                    <td className="py-4 px-4 rounded-l-xl border-l border-white/5 text-gray-200">
                      {`${entry.nombre || ''} ${entry.apellido || ''}`.trim() || 'Sin nombre'}
                    </td>
                    <td className="py-4 px-4 text-gray-300">{entry.tipo}</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">${Number(entry.monto).toLocaleString('es-AR')}</td>
                    <td className="py-4 px-4 text-center text-gray-300">{entry.metodo}</td>
                    <td className="py-4 px-4 text-center rounded-r-xl text-gray-300">
                      {new Date(entry.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
