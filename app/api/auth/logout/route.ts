import { NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
  const supabase = await supabaseServer()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/login', url.origin))
}

