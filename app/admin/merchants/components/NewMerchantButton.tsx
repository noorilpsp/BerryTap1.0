'use client'

import { Link } from '@/components/ui/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConditionalRender } from '@/components/ConditionalRender'
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'

export function NewMerchantButton() {
  const { isPlatformAdmin, loading } = usePermissionsContext()

  // Only platform admins can create merchants
  return (
    <ConditionalRender requirePlatformAdmin fallback={null}>
      <Button asChild>
        <Link href="/admin/merchants/new" className="gap-2">
          <Plus className="size-4" />
          New merchant
        </Link>
      </Button>
    </ConditionalRender>
  )
}

