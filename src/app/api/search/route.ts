import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/supabase/auth'
import { makePlacesService } from '@/lib/factories/service.factory'
import { PlacesSearchParams } from '@/lib/types/places'

const placesService = makePlacesService()

export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const body: PlacesSearchParams = await request.json()

    if (!body.query || !body.city) {
      return NextResponse.json({ error: 'query and city are required' }, { status: 400 })
    }

    const results = await placesService.search(body)
    return NextResponse.json(results)
  })
}
