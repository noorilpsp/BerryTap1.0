'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'

type Merchant = {
  id: string
  name: string
  status: string
  businessType: string
  createdAtFormatted: string
}

type MerchantTableRowProps = {
  merchant: Merchant
}

export function MerchantTableRow({ merchant }: MerchantTableRowProps) {
  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
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
      <TableCell>{merchant.createdAtFormatted}</TableCell>
    </TableRow>
  )
}
