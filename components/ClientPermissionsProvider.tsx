'use client'

import dynamic from 'next/dynamic'

// Load PermissionsProvider only on client to avoid blocking prerendering with cacheComponents
const PermissionsProvider = dynamic(
  () => import('@/lib/contexts/PermissionsContext').then((mod) => ({ default: mod.PermissionsProvider })),
  { ssr: false }
)

export function ClientPermissionsProvider({ children }: { children: React.ReactNode }) {
  return <PermissionsProvider>{children}</PermissionsProvider>
}
