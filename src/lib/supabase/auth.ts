import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

type AuthenticatedHandler = (user: User) => Promise<NextResponse>

export async function withAuth(handler: AuthenticatedHandler): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handler(user)
}
