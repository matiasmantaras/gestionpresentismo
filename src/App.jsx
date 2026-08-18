import { useState, useEffect } from 'react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/pages/Dashboard'
import MiembrosGenerales from './components/pages/MiembrosGenerales'
import LideresMinisterio from './components/pages/LideresMinisterio'
import GrupoJovenes from './components/pages/GrupoJovenes'
import HogaresRumbo from './components/pages/HogaresRumbo'
import Reportes from './components/pages/Reportes'
import DiezmoOfrendas from './components/pages/DiezmoOfrendas'
import TestSupabase from './components/pages/TestSupabase'
import Login from './components/auth/Login'
import { getSession, onAuthStateChange, signOut } from './utils/auth'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión al cargar
    checkSession()

    // Escuchar cambios en la autenticación (storage events de otras pestañas)
    const unsubscribe = onAuthStateChange(({ session, user: authUser }) => {
      setUser(authUser)
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    const { user: sessionUser } = await getSession()
    setUser(sessionUser)
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setCurrentView('dashboard')
  }

  const isDiezmoUser = (currentUser) => currentUser?.username === 'diezmo' || currentUser?.rol === 'diezmo'

  const renderView = () => {
    if (currentView === 'diezmo' && !isDiezmoUser(user)) {
      return <Dashboard onNavigate={setCurrentView} />
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'miembros':
        return <MiembrosGenerales />
      case 'lideres':
        return <LideresMinisterio />
      case 'jovenes':
        return <GrupoJovenes />
      case 'hogares':
        return <HogaresRumbo user={user} />
      case 'reportes':
        return <Reportes />
      case 'diezmo':
        return <DiezmoOfrendas />
      case 'test-supabase':
        return <TestSupabase />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-6 bg-dark-800/50 rounded-2xl mb-4 border border-white/10">
            <div className="animate-spin w-16 h-16 border-4 border-electric-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-400 text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar login si no hay usuario autenticado
  if (!user) {
    return <Login onLoginSuccess={setUser} />
  }

  // Aplicación principal
  return (
    <div className="min-h-screen bg-dark-900">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentView={currentView}
          user={user}
          onNavigate={(view) => {
            setCurrentView(view)
            setSidebarOpen(false)
          }}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

