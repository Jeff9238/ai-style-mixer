import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Mixer from './mixer'

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

  // 2. Fetch History (Gallery)
  const { data: history } = await supabase
    .from('generations')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Credit Counter */}
        <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          
          <div className="text-right">
             <div className="bg-black/50 px-4 py-2 rounded-lg border border-gray-600 flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Credits: </span>
                    {/* If profile is null (new user), we assume 3 (default) */}
                    <span className={`text-xl font-bold ${profile?.credits === 0 ? 'text-red-500' : 'text-green-400'}`}>
                        {profile?.credits ?? 3}
                    </span>
                </div>
             </div>
             {profile?.credits === 0 && (
                 <button className="mt-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold hover:bg-yellow-400 transition">
                     ⚡ Upgrade to VIP
                 </button>
             )}
          </div>
        </div>

        {/* The Mixer Tool */}
        <Mixer />

        {/* The History Section */}
        <div className="mt-16 border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">My Collection 📂</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {history?.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700 hover:border-blue-500 transition">
                        <img src={item.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                            <p className="text-xs text-gray-300 line-clamp-2">{item.prompt}</p>
                        </div>
                    </div>
                ))}

                {(!history || history.length === 0) && (
                    <p className="text-gray-500 col-span-3">No images yet. Start mixing!</p>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}