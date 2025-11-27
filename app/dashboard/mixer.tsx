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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'style') => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await fileToBase64(file)
      if (type === 'person') setPersonImage(base64)
      else setStyleImage(base64)
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
        
        // 1. Check for Specific Errors (Like 402 Payment Required)
        if (!response.ok) {
            if (response.status === 402) {
                throw new Error("No credits left")
            }
            throw new Error(data.error || "Generation failed")
        }

        // 2. Success!
        setGeneratedImage(data.imageUrl)
        
        // 3. Refresh the page to update Credits and History
        router.refresh()

    } catch (e: any) {
        // Handle the specific credit error nicely
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