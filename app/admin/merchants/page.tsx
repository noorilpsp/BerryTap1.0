import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { desc, ilike } from 'drizzle-orm'

import { db } from '@/lib/db'
import { merchants } from '@/db/schema/merchants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PageProps = {
  searchParams?: { q?: string }
}

function formatDate(value: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value)
}

export default async function AdminMerchantsPage({ searchParams }: PageProps) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q.trim() : ''

  let merchantsQuery = db
    .select({
      id: merchants.id,
      name: merchants.name,
      status: merchants.status,
      businessType: merchants.businessType,
      createdAt: merchants.createdAt,
    })
    .from(merchants)

  if (query) {
    merchantsQuery = merchantsQuery.where(ilike(merchants.name, `%${query}%`))
  }

  const rows = await merchantsQuery.orderBy(desc(merchants.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Merchants</h1>
          <p className="text-muted-foreground">
            View and search merchants. Click a row to open details.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <form className="flex w-full gap-2 sm:w-80" action="/admin/merchants">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search by name"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
          <Button asChild>
            <Link href="/admin/merchants/new" className="gap-2">
              <Plus className="size-4" />
              New merchant
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Business Type</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                  No merchants found{query ? ` for “${query}”` : ''}.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((merchant) => (
                <TableRow
                  key={merchant.id}
                  className="cursor-pointer"
                  onClick={() => {
                    // Allow full-row click navigation without nesting links.
                    window.location.href = `/admin/merchants/${merchant.id}`
                  }}
                >
                  <TableCell>
                    <Link
                      href={`/admin/merchants/${merchant.id}`}
                      className="font-medium hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {merchant.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {merchant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{merchant.businessType}</TableCell>
                  <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
