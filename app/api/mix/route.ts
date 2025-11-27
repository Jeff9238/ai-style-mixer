import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
  try {
    const { personImage, styleImage, isCinematic, isExactFace } = await req.json()
    const supabase = await createClient()
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Wallet Logic
    let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) {
        const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id, credits: 3 }).select().single()
        profile = newProfile
    }
    if (profile.credits < 1) return NextResponse.json({ error: 'No credits left' }, { status: 402 })

    // 3. Gemini Logic
    const personPart = { inlineData: { data: personImage.split(',')[1], mimeType: 'image/jpeg' } }
    const stylePart = { inlineData: { data: styleImage.split(',')[1], mimeType: 'image/jpeg' } }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    
    // --- DYNAMIC PROMPT ENGINEERING ---
    let instructions = "Analyze these two images. Create a visual prompt for an image generator. The subject is the person from image 1. The outfit is from image 2. Output ONLY the raw visual description in less than 40 words. Comma separated keywords."
    
    if (isCinematic) {
        instructions += " Style: Cinematic 8k masterpiece, dramatic lighting, photorealistic."
    }
    
    if (isExactFace) {
        // UPDATED PROMPT FOR FULL BODY:
        instructions += " CRITICAL: Generate a FULL BODY wide shot. Do not crop the head or feet. The face must match image 1 exactly, but keep the camera zoomed out to show the entire outfit and shoes."
    } else {
        // Default behavior also encourages full body
        instructions += " Ensure the full outfit is visible from head to toe."
    }

    const result = await model.generateContent([instructions, personPart, stylePart])
    const response = await result.response
    const textDescription = response.text()

    const randomSeed = Math.floor(Math.random() * 1000)
    const cleanPrompt = encodeURIComponent(textDescription)
    // We append 'flux' or 'realism' to the URL based on settings
    const finalImageUrl = `https://pollinations.ai/p/${cleanPrompt}?seed=${randomSeed}&width=1024&height=1024&model=flux&enhance=${isExactFace}`

    // 4. Save & Charge
    await supabase.from('generations').insert({ user_email: user.email, image_url: finalImageUrl, prompt: textDescription })
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id)

    return NextResponse.json({ prompt: textDescription, imageUrl: finalImageUrl })
    
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}