import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogoutButton } from '@/components/ui/LogoutButton'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-indigo-600">ScanFreela</span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Buscar
            </Link>
            <Link href="/pipeline" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pipeline
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
