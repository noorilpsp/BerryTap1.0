import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { unstable_cache } from '@/lib/unstable-cache'
import { MerchantsList } from './MerchantsList'
import { NewMerchantButton } from './NewMerchantButton'

function formatDate(value: Date | string | null) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const getMerchants = unstable_cache(
  async () =>
    db
      .select({
        id: merchants.id,
        name: merchants.name,
        status: merchants.status,
        businessType: merchants.businessType,
        createdAt: merchants.createdAt,
      })
      .from(merchants)
      .orderBy(desc(merchants.createdAt))
      .limit(100), // Reduced from 500 to 100 for better initial load performance
  ['admin-merchants-list'],
  { revalidate: 7200 },
)

export async function MerchantsData() {
  type MerchantRow = {
    id: string
    name: string
    status: string
    businessType: string
    createdAt: Date | string | null
  }

  const rows = (await getMerchants()) as MerchantRow[]

  // Format dates in Server Component
  const formattedMerchants = rows.map((row) => ({
    ...row,
    createdAtFormatted: formatDate(row.createdAt),
  }))

  return (
    <MerchantsList
      merchants={formattedMerchants}
      newMerchantButton={<NewMerchantButton />}
    />
  )
}
