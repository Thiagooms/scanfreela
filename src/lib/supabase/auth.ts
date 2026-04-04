import { NextResponse } from 'next/server'
import { User } from '@supabase/supabase-js'
import { UnauthorizedError } from '@/lib/http/errors'
import { errorResponse } from '@/lib/http/responses'
import { createClient } from '@/lib/supabase/server'

type AuthenticatedHandler = (user: User) => Promise<NextResponse>

export async function withAuth(handler: AuthenticatedHandler): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(new UnauthorizedError())
  }

  return handler(user)
}
