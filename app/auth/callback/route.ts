import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // --- DEBUG MODE: PRINT THE ERROR ---
      return NextResponse.json({ 
        message: "Login Failed", 
        error_details: error.message,
        error_code: error.code 
      })
    }
  }

  return NextResponse.json({ message: "No code found in URL" })
}