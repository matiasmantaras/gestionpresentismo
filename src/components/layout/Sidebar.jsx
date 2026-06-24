export default function Sidebar({ isOpen, currentView, onNavigate, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'chart', color: 'from-electric-500 to-cyber-500' },
    { id: 'miembros', label: 'Miembros Generales', icon: 'users', color: 'from-emerald-500 to-teal-500' },
    { id: 'lideres', label: 'Líderes de Ministerio', icon: 'star', color: 'from-amber-500 to-orange-500' },
    { id: 'jovenes', label: 'Grupo de Jóvenes', icon: 'heart', color: 'from-neon-500 to-pink-500' },
    { id: 'test-supabase', label: '🧪 Test Supabase', icon: 'database', color: 'from-violet-500 to-purple-500' },
  ]

  const icons = {
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    star: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    heart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    database: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed top-0 left-0 z-30
          h-screen w-72 bg-dark-800/80 backdrop-blur-xl border-r border-white/10
          shadow-[0_8px_32px_0_rgba(0,128,255,0.1)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 md:hidden">
            <h2 className="text-xl font-display font-bold text-electric-400">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors active:scale-95"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-5 py-4 rounded-xl font-medium
                  transition-all duration-200 group relative overflow-hidden
                  ${
                    currentView === item.id
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-[0_0_20px_rgba(0,128,255,0.3)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }
                `}
              >
                {currentView !== item.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                )}
                <div className="relative z-10 flex items-center space-x-3 w-full">
                  {icons[item.icon]}
                  <span className="font-semibold">{item.label}</span>
                </div>
                {currentView === item.id && (
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                )}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-dark-700/50 backdrop-blur-sm rounded-xl border border-electric-500/20">
            <p className="text-xs font-semibold text-electric-400 mb-1">Sistema v1.0</p>
            <p className="text-xs text-gray-500">Gestión de Presentismo</p>
          </div>
        </div>
      </aside>
    </>
  )
}
