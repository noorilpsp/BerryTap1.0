'use client'

import { useState } from 'react'
import { z } from 'zod'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bar', label: 'Bar' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'other', label: 'Other' },
]

const merchantStatuses = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
]

const subscriptionTiers = [
  { value: 'trial', label: 'Trial' },
  { value: 'basic', label: 'Basic' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
]

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const formSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  legalName: z.string().min(1, 'Legal name is required'),
  contactEmail: z.string().email('Enter a valid email'),
  businessType: z.string().min(1, 'Business type is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  locationName: z.string().min(1, 'Location name is required'),
  phone: z.string().min(6, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerEmail: z.string().email('Enter a valid owner email'),
  subscriptionTier: z.string().min(1, 'Subscription tier is required'),
  subscriptionExpiresAt: z.string().optional().or(z.literal('')),
})

type MerchantFormValues = z.infer<typeof formSchema>

export default function NewMerchantPage() {
  const [values, setValues] = useState<MerchantFormValues>({
    name: '',
    legalName: '',
    contactEmail: '',
    businessType: 'restaurant',
    status: 'onboarding',
    notes: '',
    locationName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    timezone: 'Europe/Brussels',
    ownerName: '',
    ownerEmail: '',
    subscriptionTier: 'trial',
    subscriptionExpiresAt: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof MerchantFormValues, string>>>({})
  const [fileErrors, setFileErrors] = useState<{ logo?: string; banner?: string }>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const setField = <K extends keyof MerchantFormValues>(key: K, value: MerchantFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validateFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP are allowed'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be 2MB or smaller'
    }
    return ''
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, kind: 'logo' | 'banner') => {
    const file = event.target.files?.[0]
    if (!file) {
      setFileErrors((prev) => ({ ...prev, [kind]: undefined }))
      if (kind === 'logo') setLogoFile(null), setLogoPreview(null)
      if (kind === 'banner') setBannerFile(null), setBannerPreview(null)
      return
    }

    const message = validateFile(file)
    if (message) {
      setFileErrors((prev) => ({ ...prev, [kind]: message }))
      if (kind === 'logo') setLogoFile(null), setLogoPreview(null)
      if (kind === 'banner') setBannerFile(null), setBannerPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(file)
    if (kind === 'logo') {
      setLogoFile(file)
      setLogoPreview(previewUrl)
    } else {
      setBannerFile(file)
      setBannerPreview(previewUrl)
    }
    setFileErrors((prev) => ({ ...prev, [kind]: undefined }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = formSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof MerchantFormValues, string>> = {}
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (messages?.[0]) {
          fieldErrors[field as keyof MerchantFormValues] = messages[0]
        }
      }
      setErrors(fieldErrors)
      return
    }

    // Files are optional but if provided they must be valid.
    const newFileErrors: { logo?: string; banner?: string } = {}
    if (logoFile) {
      const message = validateFile(logoFile)
      if (message) newFileErrors.logo = message
    }
    if (bannerFile) {
      const message = validateFile(bannerFile)
      if (message) newFileErrors.banner = message
    }
    setFileErrors(newFileErrors)
    if (newFileErrors.logo || newFileErrors.banner) {
      return
    }

    setErrors({})
    // Placeholder: upload to Vercel Blob would be wired here using the selected files.
    console.info('Valid form ready to submit', {
      ...parsed.data,
      logoFileName: logoFile?.name,
      bannerFileName: bannerFile?.name,
    })
  }

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Save draft</Button>
        </div>

        <Accordion type="single" collapsible defaultValue="business">
          <AccordionItem value="business">
            <AccordionTrigger className="text-left text-lg font-semibold">
              Business Information
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Business name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={(event) => setField('name', event.target.value)}
                    placeholder="BerryTap Bistro"
                  />
                  {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal name</Label>
                  <Input
                    id="legalName"
                    name="legalName"
                    value={values.legalName}
                    onChange={(event) => setField('legalName', event.target.value)}
                    placeholder="BerryTap BV"
                  />
                  {errors.legalName && <p className="text-destructive text-sm">{errors.legalName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={values.contactEmail}
                    onChange={(event) => setField('contactEmail', event.target.value)}
                    placeholder="contact@berrytap.com"
                  />
                  {errors.contactEmail && <p className="text-destructive text-sm">{errors.contactEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business type</Label>
                  <Select
                    name="businessType"
                    value={values.businessType}
                    onValueChange={(value) => setField('businessType', value)}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-destructive text-sm">{errors.businessType}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" value={values.status} onValueChange={(value) => setField('status', value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {merchantStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={values.notes ?? ''}
                    onChange={(event) => setField('notes', event.target.value)}
                    placeholder="Internal notes..."
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger className="text-left text-lg font-semibold">
              First Location
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo (2MB max, JPG/PNG/WEBP)</Label>
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleFileChange(event, 'logo')}
                  />
                  {logoPreview && (
                    <div className="border-muted bg-muted/30 text-sm text-muted-foreground flex items-center gap-3 rounded-md border p-2">
                      <img src={logoPreview} alt="Logo preview" className="size-12 rounded object-cover" />
                      <span className="truncate">{logoFile?.name}</span>
                    </div>
                  )}
                  {fileErrors.logo && <p className="text-destructive text-sm">{fileErrors.logo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner">Banner (2MB max, JPG/PNG/WEBP)</Label>
                  <Input
                    id="banner"
                    name="banner"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => handleFileChange(event, 'banner')}
                  />
                  {bannerPreview && (
                    <div className="border-muted bg-muted/30 text-sm text-muted-foreground flex items-center gap-3 rounded-md border p-2">
                      <img src={bannerPreview} alt="Banner preview" className="h-14 w-24 rounded object-cover" />
                      <span className="truncate">{bannerFile?.name}</span>
                    </div>
                  )}
                  {fileErrors.banner && <p className="text-destructive text-sm">{fileErrors.banner}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationName">Location name</Label>
                  <Input
                    id="locationName"
                    name="locationName"
                    value={values.locationName}
                    onChange={(event) => setField('locationName', event.target.value)}
                    placeholder="Central Station"
                  />
                  {errors.locationName && <p className="text-destructive text-sm">{errors.locationName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={values.phone}
                    onChange={(event) => setField('phone', event.target.value)}
                    placeholder="+32 123 456 789"
                  />
                  {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={values.address}
                    onChange={(event) => setField('address', event.target.value)}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={values.city}
                    onChange={(event) => setField('city', event.target.value)}
                    placeholder="Brussels"
                  />
                  {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={values.country}
                    onChange={(event) => setField('country', event.target.value)}
                    placeholder="Belgium"
                  />
                  {errors.country && <p className="text-destructive text-sm">{errors.country}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    value={values.timezone}
                    onChange={(event) => setField('timezone', event.target.value)}
                    placeholder="Europe/Brussels"
                  />
                  {errors.timezone && <p className="text-destructive text-sm">{errors.timezone}</p>}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="owner">
            <AccordionTrigger className="text-left text-lg font-semibold">
              Owner & Subscription
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner full name</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={values.ownerName}
                    onChange={(event) => setField('ownerName', event.target.value)}
                    placeholder="Noor Ilani"
                  />
                  {errors.ownerName && <p className="text-destructive text-sm">{errors.ownerName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Owner email</Label>
                  <Input
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    value={values.ownerEmail}
                    onChange={(event) => setField('ownerEmail', event.target.value)}
                    placeholder="owner@example.com"
                  />
                  {errors.ownerEmail && <p className="text-destructive text-sm">{errors.ownerEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionTier">Subscription tier</Label>
                  <Select
                    name="subscriptionTier"
                    value={values.subscriptionTier}
                    onValueChange={(value) => setField('subscriptionTier', value)}
                  >
                    <SelectTrigger id="subscriptionTier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionTiers.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subscriptionTier && <p className="text-destructive text-sm">{errors.subscriptionTier}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionExpiresAt">Subscription expiry</Label>
                  <Input
                    id="subscriptionExpiresAt"
                    name="subscriptionExpiresAt"
                    type="date"
                    value={values.subscriptionExpiresAt ?? ''}
                    onChange={(event) => setField('subscriptionExpiresAt', event.target.value)}
                  />
                  {errors.subscriptionExpiresAt && (
                    <p className="text-destructive text-sm">{errors.subscriptionExpiresAt}</p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Save draft</Button>
        </div>
      </form>
    </div>
  )
}
