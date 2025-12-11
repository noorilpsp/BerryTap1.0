import { Badge } from '@/components/ui/badge'

// Server Component - no 'use client'
import { NewMerchantForm } from './components/NewMerchantForm'

export default function NewMerchantPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">New Merchant</h1>
          <Badge variant="outline">Draft</Badge>
        </div>
        <p className="text-muted-foreground">
          Capture core business, first location, and owner/subscription details. Validation and submission will be added later.
        </p>
      </div>
      <NewMerchantForm />
    </div>
  )
}
