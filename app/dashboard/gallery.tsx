'use client'

import { useState } from 'react'
import { Image as ImageIcon, Trash2, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Gallery({ initialHistory }: { initialHistory: any[] }) {
  const [history, setHistory] = useState(initialHistory)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this image?")) return
    setHistory(history.filter(item => item.id !== id))
    await fetch('/api/delete', { method: 'POST', body: JSON.stringify({ id }) })
    router.refresh()
  }

  return (
    <section id="history" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" /> Recent Creations
            </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {history?.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-lg">
                    
                    {/* IMAGE AREA */}
                    <div className="relative aspect-[3/4] bg-black">
                        <img src={item.image_url} className="w-full h-full object-cover" />
                    </div>

                    {/* ACTION BAR (Always visible below image) */}
                    <div className="p-3 bg-gray-900 border-t border-white/5">
                        <p className="text-xs text-gray-400 line-clamp-1 mb-3">{item.prompt}</p>
                        
                        <div className="flex gap-2">
                            <a 
                                href={item.image_url} 
                                target="_blank" 
                                download 
                                className="flex-1 flex items-center justify-center py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 border border-white/10 transition"
                            >
                                <Download size={14} className="mr-2"/> Download
                            </a>
                            
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {(!history || history.length === 0) && (
                <div className="col-span-full py-10 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-500">No images yet.</p>
                </div>
            )}
        </div>
    </section>
  )
}