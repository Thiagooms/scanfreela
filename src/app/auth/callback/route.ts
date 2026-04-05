import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { buildAppUrlSafe } from '@/lib/config/app-url'
import { ProfileRepository } from '@/lib/repositories/profile.repository'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const fallbackOrigin = requestUrl.origin
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const profileRepository = new ProfileRepository(supabase as unknown as SupabaseClient)
      await profileRepository.ensureProfile(data.user.id).catch((profileError: unknown) => {
        console.error('[auth/callback] ensureProfile falhou:', profileError)
      })
      return NextResponse.redirect(buildAppUrlSafe('/dashboard', fallbackOrigin))
    }
  }

  return NextResponse.redirect(buildAppUrlSafe('/login?error=auth', fallbackOrigin))
}
