import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load NewMerchantForm - it's a heavy form component with image optimization
// Only needed on this page, so code split it
const NewMerchantForm = dynamic(() => import('./components/NewMerchantForm').then((mod) => ({ default: mod.NewMerchantForm })), {
  loading: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  ),
})

function NewMerchantFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function NewMerchantPage() {
  return (
    <div className="space-y-6">
      {/* Critical: Header shows immediately */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">New Merchant</h1>
          <Badge variant="outline">Draft</Badge>
        </div>
        <p className="text-muted-foreground">
          Capture core business, first location, and owner/subscription details. Validation and submission will be added later.
        </p>
      </div>

      {/* Non-critical: Form streams in via Suspense */}
      <Suspense fallback={<NewMerchantFormSkeleton />}>
        <NewMerchantForm />
      </Suspense>
    </div>
  )
}
