import { generateEbook } from '@/lib/ai-generator'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Route: Starting ebook generation...')
    
    // DEBUG: Vérifier la clé API dans cette route
    const openaiKey = process.env.OPENAI_API_KEY
    console.log('🔑 DEBUG OpenAI Key in generate-ebook:', {
      configured: !!openaiKey,
      prefix: openaiKey ? openaiKey.substring(0, 10) + '...' : 'NOT_SET',
      suffix: openaiKey ? '...' + openaiKey.slice(-4) : 'NOT_SET'
    })
    
    const formData = await request.json()
    
    console.log('📋 Received form data:', {
      idea: formData.idea?.substring(0, 50) + '...',
      genre: formData.genre,
      author: formData.author
    })
    
    // Générer l'ebook côté serveur où les env vars sont disponibles
    console.log('🚀 Calling generateEbook...')
    const result = await generateEbook(formData)
    
    console.log('✅ Generation successful:', {
      hasTitle: !!result.title,
      hasContent: !!result.content,
      hasAuthor: !!result.author,
      contentLength: result.content?.length || 0
    })
    
    const response = {
      success: true,
      data: result
    }
    
    console.log('📤 Sending response:', JSON.stringify(response).substring(0, 200) + '...')
    
    return Response.json(response)
    
  } catch (error) {
    console.error('❌ API Route Error:', error)
    console.error('❌ Error Stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('❌ Error Type:', typeof error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse))
    
    return Response.json(errorResponse, { status: 500 })
  }
}