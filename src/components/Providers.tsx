'use client'

import { RouterProvider } from 'react-aria-components'
import { useRouter } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return <RouterProvider navigate={router.push}>{children}</RouterProvider>
}
