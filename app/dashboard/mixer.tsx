'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Mixer() {
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [styleImage, setStyleImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  
  const router = useRouter()

  // --- NEW: COMPRESSION FUNCTION ---
  // This takes a huge iPhone photo and shrinks it to ~500kb
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      img.onload = () => {
        // Create a virtual canvas to draw the resized image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Calculate new size (Max 1024px)
        const MAX_SIZE = 1024
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress to JPEG (0.7 quality)
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl)
      }
      
      img.onerror = (err) => reject(err)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'style') => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Use the new compressor instead of raw file
        const compressedBase64 = await compressImage(file)
        if (type === 'person') setPersonImage(compressedBase64)
        else setStyleImage(compressedBase64)
      } catch (e) {
        alert("Error reading image. Please try a different one.")
      }
    }
  }

  const handleGenerate = async () => {
    if (!personImage || !styleImage) return alert("Please upload both images!")
    setLoading(true)
    setGeneratedImage(null)
    
    try {
        setStatus("Gemini is analyzing...")
        const response = await fetch('/api/mix', {
            method: 'POST',
            body: JSON.stringify({ personImage, styleImage }),
        })

        const data = await response.json()
        
        if (!response.ok) {
            if (response.status === 402) {
                throw new Error("No credits left")
            }
            throw new Error(data.error || "Generation failed")
        }

        setGeneratedImage(data.imageUrl)
        router.refresh()

    } catch (e: any) {
        if (e.message === "No credits left") {
            alert("⚠️ You have run out of free credits! Please Upgrade to VIP to continue.")
        } else {
            alert("Error: " + e.message)
        }
    } finally {
        setLoading(false)
        setStatus("")
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person Input */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">1. Upload Person</h2>
          <div className="relative border-2 border-dashed border-gray-600 rounded-lg h-64 flex items-center justify-center bg-gray-900/50 overflow-hidden group hover:border-blue-500 transition">
            {personImage ? (
              <img src={personImage} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 group-hover:text-blue-400">Click to Select Person</span>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'person')} accept="image/*" />
          </div>
        </div>

        {/* Style Input */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">2. Upload Style/Cloth</h2>
          <div className="relative border-2 border-dashed border-gray-600 rounded-lg h-64 flex items-center justify-center bg-gray-900/50 overflow-hidden group hover:border-purple-500 transition">
             {styleImage ? (
              <img src={styleImage} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 group-hover:text-purple-400">Click to Select Style</span>
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'style')} accept="image/*" />
          </div>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl text-xl font-bold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? status : "Generate Mix 🎨"}
      </button>

      {generatedImage && (
          <div className="mt-8 p-4 bg-gray-800 rounded-xl border border-gray-700 animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-center text-green-400">✨ Result ✨</h2>
              <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-2xl">
                  <img src={generatedImage} alt="Generated result" className="w-full h-full object-cover" />
              </div>
          </div>
      )}
    </div>
  )
}