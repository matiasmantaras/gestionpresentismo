export default function Header({ onMenuClick }) {
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

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-200">Administrador</p>
              <p className="text-xs text-electric-400 font-medium">Panel de Control</p>
            </div>
            <div className="w-12 h-12 bg-dark-700/50 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-electric-500/30 hover:border-electric-500 hover:shadow-[0_0_20px_rgba(0,128,255,0.3)] transition-all duration-200 cursor-pointer group">
              <svg className="w-6 h-6 text-electric-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
