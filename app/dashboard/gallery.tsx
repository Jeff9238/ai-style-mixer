'use client'

import { useState } from 'react'
import { Image as ImageIcon, Trash2, Download, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Gallery({ initialHistory }: { initialHistory: any[] }) {
  const [history, setHistory] = useState(initialHistory)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this masterpiece?")) return

    // 1. Optimistic Update (Remove from screen immediately)
    setHistory(history.filter(item => item.id !== id))

    // 2. Delete from Backend
    await fetch('/api/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
    })
    
    // 3. Refresh server data
    router.refresh()
  }

  return (
    <section id="history" className="scroll-mt-10">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" /> Recent Creations
            </h2>
            <span className="text-sm text-gray-500">{history.length} items</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {history?.map((item) => (
                <div key={item.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-white/5 hover:border-purple-500/50 transition duration-300">
                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                        <p className="text-xs text-gray-300 line-clamp-2 mb-3">{item.prompt}</p>
                        
                        <div className="flex gap-2">
                            {/* Download Button */}
                            <a href={item.image_url} target="_blank" download className="flex-1 flex items-center justify-center py-2 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-lg hover:bg-white/20 transition">
                                <Download size={14} />
                            </a>
                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {(!history || history.length === 0) && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-500">No masterpieces yet.</p>
                </div>
            )}
        </div>
    </section>
  )
}