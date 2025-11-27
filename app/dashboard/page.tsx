import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Mixer from './mixer'
import Gallery from './gallery' // <--- Importing the new Smart Gallery
import { LayoutGrid, Image as ImageIcon, CreditCard, Settings, Sparkles } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/')

  // 1. Fetch Credits (Wallet)
  let { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()
  
  // 2. Fetch History (Gallery Data)
  const { data: history } = await supabase
    .from('generations')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans selection:bg-purple-500 selection:text-white scroll-smooth">
      
      {/* --- SIDEBAR (Fixed Navigation) --- */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col fixed inset-y-0 left-0 bg-black z-50">
        
        {/* Logo Area */}
        <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">StyleMixer</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2 flex-1">
            <a href="#top" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl transition font-medium hover:bg-white/20">
                <LayoutGrid className="w-5 h-5" /> Dashboard
            </a>
            <a href="#history" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition font-medium">
                <ImageIcon className="w-5 h-5" /> My Collection
            </a>
            <a href="#credits" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition font-medium">
                <Settings className="w-5 h-5" /> Settings
            </a>
        </nav>

        {/* Credit Card / Wallet Section */}
        <div id="credits" className="mt-auto p-4 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</span>
                <span className={`text-lg font-bold ${profile?.credits === 0 ? 'text-red-500' : 'text-green-400'}`}>
                    {profile?.credits ?? 3}
                </span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-4 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full w-1/2"></div>
            </div>
            <button className="w-full py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Upgrade Plan
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 p-8 md:p-12 relative scroll-smooth">
        
        {/* Header */}
        <header id="top" className="flex justify-between items-center mb-12 pt-2">
            <div>
                <h1 className="text-3xl font-bold mb-1">Create Magic</h1>
                <p className="text-gray-500">Welcome back, creator.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border border-white/10">
                    <span className="font-bold text-sm">{user.email?.substring(0,2).toUpperCase()}</span>
                </div>
            </div>
        </header>

        {/* The Mixer Tool (AI Controls) */}
        <section className="mb-24">
            <Mixer />
        </section>

        {/* The Smart Gallery (History & Delete) */}
        <Gallery initialHistory={history || []} />
        
        {/* Spacing at bottom */}
        <div className="h-20"></div>

      </main>
    </div>
  )
}