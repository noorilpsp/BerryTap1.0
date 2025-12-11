import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return NextResponse.json({ hasSession: !!session })
}
