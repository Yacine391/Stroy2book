import { generateEbook } from '@/lib/ai-generator'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route: Starting ebook generation...')
    
    const formData = await request.json()
    
    console.log('📋 Received form data:', {
      idea: formData.idea?.substring(0, 50) + '...',
      genre: formData.genre,
      author: formData.author
    })
    
    // Générer l'ebook côté serveur où les env vars sont disponibles
    const result = await generateEbook(formData)
    
    console.log('✅ Generation successful, returning result')
    
    return Response.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('❌ API Route Error:', error)
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}