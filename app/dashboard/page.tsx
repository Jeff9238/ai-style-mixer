import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Mixer from './mixer'
import Gallery from './gallery'
import DashboardLayout from './dashboard-layout' // Import new layout

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/')

  // Fetch Credits
  let { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
  
  // Fetch History
  const { data: history } = await supabase
    .from('generations')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout userEmail={user.email || ''} credits={profile?.credits ?? 3}>
        
        {/* The Mixer Tool */}
        <section className="mb-12">
            <Mixer />
        </section>

        {/* The Smart Gallery */}
        <Gallery initialHistory={history || []} />
        
        <div className="h-20"></div>

    </DashboardLayout>
  )
}