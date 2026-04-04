import { redirect } from 'next/navigation'
import { PipelinePageClient } from '@/components/pipeline/PipelinePageClient'
import { makePlanGuard } from '@/lib/factories/service.factory'
import { createClient } from '@/lib/supabase/server'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const planGuard = makePlanGuard(supabase)
  const plan = await planGuard.getPlan(user.id)

  if (plan !== 'paid') {
    redirect('/upgrade?reason=pipeline')
  }

  return <PipelinePageClient />
}
