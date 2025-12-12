import { EditMerchantData } from './components/EditMerchantData'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditMerchantPage({ params }: PageProps) {
  const { id } = await params

  return <EditMerchantData merchantId={id} />
}

