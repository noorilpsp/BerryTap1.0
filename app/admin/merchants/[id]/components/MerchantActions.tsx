'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PermissionButton } from '@/components/PermissionButton'
import { ConditionalRender } from '@/components/ConditionalRender'
import { usePermissionsContext } from '@/lib/contexts/PermissionsContext'
import { Trash2, Edit, Settings } from 'lucide-react'

type MerchantActionsProps = {
  merchantId: string
}

export function MerchantActions({ merchantId }: MerchantActionsProps) {
  const { getUserRole, isPlatformAdmin } = usePermissionsContext()
  const role = getUserRole(merchantId)

  return (
    <div className="flex items-center gap-2">
      {/* Edit button - visible to owners, admins, and platform admins */}
      <PermissionButton
        variant="outline"
        requireMinRole="admin"
        merchantId={merchantId}
        hideIfNoAccess={true}
        asChild
      >
        <Link href={`/admin/merchants/${merchantId}/edit`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </PermissionButton>

      {/* Settings button - visible to owners and platform admins */}
      <ConditionalRender
        requireMinRole="owner"
        merchantId={merchantId}
        fallback={
          isPlatformAdmin ? (
            <Button variant="outline" asChild>
              <Link href={`/admin/merchants/${merchantId}/settings`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          ) : null
        }
      >
        <Button variant="outline" asChild>
          <Link href={`/admin/merchants/${merchantId}/settings`}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </Button>
      </ConditionalRender>

      {/* Delete button - only visible to owners and platform admins */}
      <PermissionButton
        variant="destructive"
        requireRole="owner"
        merchantId={merchantId}
        hideIfNoAccess={true}
        fallback={
          isPlatformAdmin ? (
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          ) : null
        }
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </PermissionButton>
    </div>
  )
}

