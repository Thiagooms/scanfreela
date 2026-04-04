import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/supabase/auth'
import { makePlacesService } from '@/lib/factories/service.factory'
import { readJsonBody } from '@/lib/http/request'
import { handleRouteError } from '@/lib/http/responses'
import { parseSearchParams } from '@/lib/validation/search'

const placesService = makePlacesService()

export async function POST(request: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = parseSearchParams(await readJsonBody(request))
      const result = await placesService.search(user.id, body)
      return NextResponse.json(result.places, {
        headers: {
          'X-RateLimit-Remaining': String(result.rateLimit.remaining),
          'X-RateLimit-Reset': result.rateLimit.resetAt,
        },
      })
    } catch (error) {
      return handleRouteError(error, 'Search API error:')
    }
  })
}
