import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { Features } from '@/components/landing/Features'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="pt-[clamp(3.5rem,6.25vw,5rem)]">
      <Navbar />
      <Hero />
      <ProductShowcase />
      <Features />
    </main>
  )
}
