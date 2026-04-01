export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/30">
              MC
            </div>
            <h1 className="text-2xl font-black text-slate-900">Mi Camarero</h1>
          </div>
          <p className="text-sm text-slate-500">La plataforma inteligente para tu restaurante</p>
        </div>
        {children}
      </div>
    </div>
  )
}
