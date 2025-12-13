import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

// Prevent prerendering - this is a dynamic API route
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return NextResponse.json({ hasSession: !!session })
}
