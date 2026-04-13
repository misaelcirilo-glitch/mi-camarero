import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher variant="light" />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
              MC
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Mi Camarero</h1>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
