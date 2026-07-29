import { useState } from 'react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/pages/Dashboard'
import MiembrosGenerales from './components/pages/MiembrosGenerales'
import LideresMinisterio from './components/pages/LideresMinisterio'
import GrupoJovenes from './components/pages/GrupoJovenes'
import Reportes from './components/pages/Reportes'
import TestSupabase from './components/pages/TestSupabase'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />
      case 'miembros':
        return <MiembrosGenerales />
      case 'lideres':
        return <LideresMinisterio />
      case 'jovenes':
        return <GrupoJovenes />
      case 'reportes':
        return <Reportes />
      case 'test-supabase':
        return <TestSupabase />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view)
            setSidebarOpen(false)
          }}
          onClose={() => setSidebarOpen(false)}
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

