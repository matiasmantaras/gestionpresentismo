import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  getPersonas, 
  addPersona, 
  getEstadisticas, 
  migrarDatosLocalStorage 
} from '../../utils/supabaseStorage'
import { CheckCircle, XCircle, Database, Upload, RefreshCw } from 'lucide-react'

export default function TestSupabase() {
  const [estado, setEstado] = useState({
    conectado: false,
    cargando: true,
    error: null,
    personas: { miembros: 0, lideres: 0, jovenes: 0 },
    migracionCompleta: false,
  })

  useEffect(() => {
    verificarConexion()
  }, [])

  const verificarConexion = async () => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }))
    
    try {
      // Test 1: Verificar conexión básica
      const { data, error } = await supabase
        .from('personas')
        .select('count')
        .limit(1)
      
      if (error) throw error

      // Test 2: Obtener conteo de personas por categoría
      const miembros = await getPersonas('miembros')
      const lideres = await getPersonas('lideres')
      const jovenes = await getPersonas('jovenes')

      setEstado({
        conectado: true,
        cargando: false,
        error: null,
        personas: {
          miembros: miembros.length,
          lideres: lideres.length,
          jovenes: jovenes.length,
        },
        migracionCompleta: false,
      })
    } catch (error) {
      setEstado(prev => ({
        ...prev,
        conectado: false,
        cargando: false,
        error: error.message,
      }))
    }
  }

  const migrarDatos = async () => {
    setEstado(prev => ({ ...prev, cargando: true }))
    
    try {
      const resultado = await migrarDatosLocalStorage()
      
      if (resultado.errores && resultado.errores.length > 0) {
        alert(`Migración completada con ${resultado.errores.length} errores. Ver consola.`)
      } else {
        alert(`✅ Migración exitosa!\n\nMiembros: ${resultado.miembros}\nLíderes: ${resultado.lideres}\nJóvenes: ${resultado.jovenes}`)
      }
      
      // Recargar datos
      await verificarConexion()
      
      setEstado(prev => ({ ...prev, migracionCompleta: true }))
    } catch (error) {
      alert(`❌ Error en migración: ${error.message}`)
      setEstado(prev => ({ ...prev, cargando: false }))
    }
  }

  const agregarPersonaPrueba = async () => {
    setEstado(prev => ({ ...prev, cargando: true }))
    
    try {
      const resultado = await addPersona('miembros', {
        nombre: `Persona de Prueba ${Date.now()}`,
        email: `prueba${Date.now()}@test.com`,
        telefono: '1234567890',
      })
      
      if (resultado.success) {
        alert('✅ Persona agregada correctamente!')
        await verificarConexion()
      } else {
        alert(`❌ Error: ${resultado.error}`)
        setEstado(prev => ({ ...prev, cargando: false }))
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      setEstado(prev => ({ ...prev, cargando: false }))
    }
  }

  if (estado.cargando && !estado.conectado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-300">Verificando conexión con Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-electric-400 via-neon-400 to-cyber-400 bg-clip-text text-transparent mb-2">
          Test de Supabase
        </h2>
        <p className="text-gray-400 text-lg">
          Verificación de conexión y migración de datos
        </p>
      </div>

      {/* Estado de Conexión */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Database className="w-8 h-8 text-electric-400" />
          <div>
            <h3 className="text-xl font-bold text-gray-200">Estado de Conexión</h3>
            <p className="text-sm text-gray-400">Base de datos PostgreSQL en Supabase</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Conexión */}
          <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
            <span className="text-gray-300 font-medium">Conexión a Supabase</span>
            {estado.conectado ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Desconectado</span>
              </div>
            )}
          </div>

          {/* Error */}
          {estado.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">
                <strong>Error:</strong> {estado.error}
              </p>
              <p className="text-red-300 text-xs mt-2">
                Verificá que las credenciales en .env.local sean correctas
              </p>
            </div>
          )}

          {/* Datos en DB */}
          {estado.conectado && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-400">{estado.personas.miembros}</p>
                <p className="text-xs text-gray-400 mt-1">Miembros</p>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-400">{estado.personas.lideres}</p>
                <p className="text-xs text-gray-400 mt-1">Líderes</p>
              </div>
              <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-center">
                <p className="text-2xl font-bold text-pink-400">{estado.personas.jovenes}</p>
                <p className="text-xs text-gray-400 mt-1">Jóvenes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      {estado.conectado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Migrar Datos */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-neon-400" />
              <h3 className="text-lg font-bold text-gray-200">Migrar Datos</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Migra todos los datos de localStorage a Supabase. 
              Solo ejecutar una vez.
            </p>
            <button
              onClick={migrarDatos}
              disabled={estado.cargando}
              className="btn-neon w-full"
            >
              {estado.cargando ? 'Migrando...' : 'Migrar desde localStorage'}
            </button>
            {estado.migracionCompleta && (
              <p className="text-green-400 text-sm mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Migración completada
              </p>
            )}
          </div>

          {/* Agregar Persona de Prueba */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-electric-400" />
              <h3 className="text-lg font-bold text-gray-200">Test de Escritura</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Agrega una persona de prueba para verificar que podés escribir en la base de datos.
            </p>
            <button
              onClick={agregarPersonaPrueba}
              disabled={estado.cargando}
              className="btn-primary w-full"
            >
              {estado.cargando ? 'Agregando...' : 'Agregar Persona de Prueba'}
            </button>
          </div>
        </div>
      )}

      {/* Botón Recargar */}
      <div className="flex justify-center">
        <button
          onClick={verificarConexion}
          disabled={estado.cargando}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${estado.cargando ? 'animate-spin' : ''}`} />
          Recargar Estado
        </button>
      </div>

      {/* Instrucciones */}
      <div className="card p-6 bg-electric-500/5 border-electric-500/20">
        <h3 className="text-lg font-bold text-gray-200 mb-3">📋 Próximos Pasos</h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li>1. Verificá que la conexión esté activa (checkmark verde)</li>
          <li>2. Click en "Migrar desde localStorage" para mover tus datos existentes</li>
          <li>3. Probá agregar una persona de prueba</li>
          <li>4. Una vez que funcione, vamos a actualizar los componentes para usar Supabase</li>
        </ol>
      </div>
    </div>
  )
}
