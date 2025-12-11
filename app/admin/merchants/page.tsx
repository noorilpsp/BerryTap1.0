import Link from 'next/link'
import { Plus } from 'lucide-react'
import { desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { Button } from '@/components/ui/button'
import { MerchantsList } from './components/MerchantsList'

function formatDate(value: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}

export default async function AdminMerchantsPage() {
  // Load all merchants for client-side filtering
  const rows = await db
    .select({
      id: merchants.id,
      name: merchants.name,
      status: merchants.status,
      businessType: merchants.businessType,
      createdAt: merchants.createdAt,
    })
    .from(merchants)
    .orderBy(desc(merchants.createdAt))
    .limit(500) // Load up to 500 merchants for client-side filtering

  // Format dates in Server Component
  const formattedMerchants = rows.map((row) => ({
    ...row,
    createdAtFormatted: formatDate(row.createdAt),
  }))

  return (
    <MerchantsList
      merchants={formattedMerchants}
      newMerchantButton={
        <Button asChild>
          <Link href="/admin/merchants/new" className="gap-2">
            <Plus className="size-4" />
            New merchant
          </Link>
        </Button>
      }
    />
  )
}
