'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* We use a high-quality Unsplash image as the 'Video' background substitute */}
        <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60"
            alt="Background"
        />
        {/* Gradient Overlay to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* 2. NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">StyleMixer</span>
        </div>
        <button 
            onClick={handleLogin}
            className="text-sm font-medium hover:text-gray-300 transition"
        >
            Log In
        </button>
      </nav>

      {/* 3. HERO CONTENT */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium tracking-wide uppercase text-gray-300">AI Engine V2.0 Live</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6">
          Reimagine <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Reality.
          </span>
        </h1>

        <p className="max-w-xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          The professional AI tool for blending human portraits with infinite style possibilities. Used by creators, designers, and visionaries.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-200"
        >
          {loading ? "Connecting..." : "Start Creating Free"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Social Proof / Footer visual */}
        <div className="mt-20 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Trusted by creators form</p>
            <div className="flex gap-8 opacity-50 grayscale">
               {/* Fake Logos for 'Professional' vibe */}
               <span className="font-bold text-xl">VOGUE</span>
               <span className="font-bold text-xl">WIRED</span>
               <span className="font-bold text-xl">THE VERGE</span>
            </div>
        </div>
      </main>
    </div>
  )
}