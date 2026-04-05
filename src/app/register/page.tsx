import { redirect } from 'next/navigation'

interface RegisterPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') query.set(key, value)
  }

  const queryString = query.toString()
  redirect(queryString ? `/login?${queryString}` : '/login')
}
