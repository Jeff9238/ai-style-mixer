'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCcw, Loader2, ScanFace, Shirt, Video, UserCheck } from 'lucide-react'

export default function Mixer() {
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [styleImage, setStyleImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  
  // --- NEW OPTIONS ---
  const [isCinematic, setIsCinematic] = useState(false)
  const [isExactFace, setIsExactFace] = useState(true)

  const resultRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // (Keep compressImage and handleFileChange exactly as they were...)
  // ... Paste your existing compressImage function here ...
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const MAX_SIZE = 1024
        let width = img.width
        let height = img.height
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE } }
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = (err) => reject(err)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'style') => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressedBase64 = await compressImage(file)
        if (type === 'person') setPersonImage(compressedBase64)
        else setStyleImage(compressedBase64)
        setGeneratedImage(null)
      } catch (e) {
        alert("Error reading image.")
      }
    }
  }

  const handleGenerate = async () => {
    if (!personImage || !styleImage) return alert("Please upload both images!")
    setLoading(true)
    setGeneratedImage(null)
    
    try {
        setStatus("Applying advanced AI filters...")
        
        // SEND NEW OPTIONS TO API
        const response = await fetch('/api/mix', {
            method: 'POST',
            body: JSON.stringify({ 
                personImage, 
                styleImage,
                isCinematic, // <--- New
                isExactFace  // <--- New
            }),
        })
        const data = await response.json()
        
        if (!response.ok) {
            if (response.status === 402) throw new Error("No credits left")
            throw new Error(data.error || "Generation failed")
        }

        setGeneratedImage(data.imageUrl)
        router.refresh()
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500)

    } catch (e: any) {
        if (e.message === "No credits left") {
            alert("⚠️ You have run out of free credits! Please Upgrade to VIP.")
        } else {
            alert("Error: " + e.message)
        }
    } finally {
        setLoading(false)
        setStatus("")
    }
  }

  const UploadCard = ({ type, image, icon: Icon, title, desc }: any) => (
    <div className="relative group w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-500 cursor-pointer">
       {/* (Keep existing UploadCard code exactly as is) */}
       {image ? (
        <>
          <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 backdrop-blur-sm">
            <p className="text-white font-medium flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <RefreshCcw size={16} /> Change Selection
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 group-hover:bg-white/10 group-hover:border-purple-500/30">
            <Icon className="w-10 h-10 text-gray-500 group-hover:text-purple-300 transition-colors duration-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors max-w-[80%] leading-relaxed">{desc}</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
            <UploadCloud size={14} /> Click to browse
          </div>
        </div>
      )}
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-30" onChange={(e) => handleFileChange(e, type)} accept="image/*" />
    </div>
  )

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <UploadCard type="person" image={personImage} icon={ScanFace} title="The Subject" desc="Upload a clear photo of the person's face." />
        <UploadCard type="style" image={styleImage} icon={Shirt} title="The Style" desc="Upload the outfit or fashion look." />
      </div>

      {/* --- NEW OPTIONS BAR --- */}
      <div className="flex flex-wrap justify-center gap-4">
        <button 
            onClick={() => setIsCinematic(!isCinematic)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${isCinematic ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
        >
            <Video size={18} /> Cinematic Mode
        </button>
        
        <button 
            onClick={() => setIsExactFace(!isExactFace)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${isExactFace ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
        >
            <UserCheck size={18} /> Keep Exact Face
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <button 
            onClick={handleGenerate}
            disabled={loading || !personImage || !styleImage}
            className="relative group w-full md:w-auto md:min-w-[300px] py-5 px-10 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_auto] hover:bg-[position:100%_0] rounded-full text-xl font-bold text-white overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-2xl shadow-purple-900/30"
        >
            <span className="relative flex items-center justify-center gap-3">
            {loading ? (
                <> <Loader2 className="w-6 h-6 animate-spin text-white/70" /> <span className="tracking-wide">{status}</span> </>
            ) : (
                <> <Sparkles className="w-6 h-6 group-hover:animate-pulse" /> <span className="tracking-wide">Generate Masterpiece</span> </>
            )}
            </span>
        </button>
      </div>

      {generatedImage && (
          <div ref={resultRef} className="mt-12 animate-fade-in scroll-mt-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 inline-flex items-center gap-3">
                    <Sparkles className="text-purple-500" /> Your Creation Ready
                </h2>
              </div>
              <div className="relative aspect-square w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] border border-white/10 group">
                  <img src={generatedImage} alt="Generated result" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                       <a href={generatedImage} download="style-mix.jpg" target="_blank" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition flex items-center gap-2">
                           <ImageIcon size={18}/> Download High-Res
                       </a>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}