import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 1. Notice we added 'async' here
export async function createClient() {
  // 2. We now 'await' the cookies
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Valid catch for Server Components
          }
        },
      },
    }
  )
}