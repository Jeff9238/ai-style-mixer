import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    const supabase = await createClient()
    
    // 1. Check User (Security)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Delete the item (RLS policy ensures they can only delete their own)
    const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email) // Double check ownership

    if (error) throw error

    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}