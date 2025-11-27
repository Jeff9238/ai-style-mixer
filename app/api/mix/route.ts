import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
  try {
    const { personImage, styleImage } = await req.json()
    const supabase = await createClient()
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. CHECK CREDITS (The Wallet Check)
    // Try to find their profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // If no profile exists yet (First time user), create one!
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({ id: user.id, credits: 3 }) // Give 3 free credits
            .select()
            .single()
        
        if (error) {
            console.error("Profile creation failed:", error)
            // If creation fails, we assume they have 0 for safety
            return NextResponse.json({ error: 'Could not create user profile' }, { status: 500 })
        }
        profile = newProfile
    }

    // Stop them if they are broke
    if (profile.credits < 1) {
        return NextResponse.json({ error: 'No credits left' }, { status: 402 })
    }

    // --- GEMINI LOGIC ---
    const personPart = { inlineData: { data: personImage.split(',')[1], mimeType: 'image/jpeg' } }
    const stylePart = { inlineData: { data: styleImage.split(',')[1], mimeType: 'image/jpeg' } }

    // Using the stable model version we found works for you
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const prompt = "Analyze these two images. Create a visual prompt for an image generator. The subject is the person from image 1. The outfit is from image 2. Output ONLY the raw visual description in less than 40 words. Comma separated keywords. No intro. No markdown."
    
    const result = await model.generateContent([prompt, personPart, stylePart])
    const response = await result.response
    const textDescription = response.text()

    const randomSeed = Math.floor(Math.random() * 1000)
    const cleanPrompt = encodeURIComponent(textDescription)
    const finalImageUrl = `https://pollinations.ai/p/${cleanPrompt}?seed=${randomSeed}&width=1024&height=1024&model=flux`

    // --- SAVING DATA ---
    await supabase.from('generations').insert({
        user_email: user.email,
        image_url: finalImageUrl,
        prompt: textDescription
    })

    // 3. CHARGE THE USER (Deduct 1 Credit)
    await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', user.id)

    return NextResponse.json({ prompt: textDescription, imageUrl: finalImageUrl })
    
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}