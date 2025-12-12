import { Skeleton } from '@/components/ui/skeleton'

export default function EditMerchantLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
