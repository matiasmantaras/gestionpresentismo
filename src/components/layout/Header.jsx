import { useState } from 'react'

export default function Header({ onMenuClick, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getUserName = () => {
    return user?.nombre || user?.username || 'Usuario'
  }

  const getUserInitial = () => {
    const name = getUserName()
    return name.charAt(0).toUpperCase()
  }

  const normalizeRole = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')

  const getUserRole = () => {
    const role = normalizeRole(user?.rol)
    const username = String(user?.username || '').trim().toLowerCase()

    if (username === 'admin' || role === 'admin' || role === 'administracion' || role === 'administrador') {
      return 'Administrador'
    }

    if (username === 'diezmo' || role === 'diezmo') {
      return 'Diezmo y Ofrendas'
    }

    return 'Usuario'
  }

  return (
    <header className="bg-dark-800/50 backdrop-blur-xl border-b border-white/10 text-white shadow-[0_8px_32px_0_rgba(0,128,255,0.1)] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl hover:bg-electric-500/10 transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-electric-500 to-neon-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-electric-500 to-neon-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,128,255,0.5)] transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-electric-400 to-neon-400 bg-clip-text text-transparent">
                Ministerio Nuevo Rumbo Alem
              </h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="w-2 h-2 bg-electric-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,128,255,0.8)]"></div>
                <p className="text-sm text-gray-400 font-medium">Sistema de Gestión de Presentismo</p>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-electric-500/10 transition-all duration-200 active:scale-95"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-200">{getUserName()}</p>
                <p className="text-xs text-electric-400 font-medium">@{user?.username} • {getUserRole()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,128,255,0.4)] font-bold text-white">
                {getUserInitial()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_0_rgba(0,128,255,0.2)] overflow-hidden z-20 animate-scale-in">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-semibold text-gray-200">{getUserName()}</p>
                    <p className="text-xs text-gray-400 mt-1">@{user?.username}</p>
                    <p className="text-xs text-electric-400 mt-1">{getUserRole()}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
