'use client'

import { useState } from 'react'
import { LayoutGrid, Image as ImageIcon, CreditCard, Settings, Sparkles, Menu, X, LogOut } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function DashboardLayout({ 
  children, 
  userEmail, 
  credits 
}: { 
  children: React.ReactNode, 
  userEmail: string, 
  credits: number 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">StyleMixer</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
            {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- SIDEBAR (Responsive) --- */}
      <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:inset-auto
      `}>
        
        {/* Logo (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">StyleMixer</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2 flex-1 mt-16 md:mt-0">
            <a href="#top" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl transition font-medium hover:bg-white/20">
                <LayoutGrid className="w-5 h-5" /> Dashboard
            </a>
            <a href="#history" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition font-medium">
                <ImageIcon className="w-5 h-5" /> My Collection
            </a>
        </nav>

        {/* Wallet Section */}
        <div className="mt-auto p-4 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Credits</span>
                <span className={`text-lg font-bold ${credits === 0 ? 'text-red-500' : 'text-green-400'}`}>
                    {credits}
                </span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-4 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full w-1/2"></div>
            </div>
            <button className="w-full py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Upgrade
            </button>
        </div>
      </aside>

      {/* --- OVERLAY for Mobile (Click to close) --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-12 relative w-full pt-20 md:pt-12">
        {/* Header */}
        <header id="top" className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Create Magic</h1>
                <p className="text-gray-500 text-sm md:text-base">Welcome back, creator.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border border-white/10">
                <span className="font-bold text-sm">{userEmail?.substring(0,2).toUpperCase()}</span>
            </div>
        </header>

        {children}
        
      </main>
    </div>
  )
}