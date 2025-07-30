import OpenAI from 'openai'

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    console.log('🔑 DIRECT TEST - OpenAI Key:', {
      configured: !!apiKey,
      prefix: apiKey ? apiKey.substring(0, 15) + '...' : 'NOT_SET',
      suffix: apiKey ? '...' + apiKey.slice(-8) : 'NOT_SET',
      length: apiKey?.length || 0
    })
    
    if (!apiKey) {
      return Response.json({ 
        error: 'No API key found',
        env_vars: Object.keys(process.env).filter(k => k.includes('OPENAI'))
      })
    }
    
    // Test direct OpenAI
    const openai = new OpenAI({ apiKey })
    
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Dis juste "Test OK"' }
      ],
      max_tokens: 10
    })
    
    return Response.json({
      success: true,
      api_key_prefix: apiKey.substring(0, 15) + '...',
      api_key_suffix: '...' + apiKey.slice(-8),
      response: result.choices[0]?.message?.content || 'No response'
    })
    
  } catch (error: any) {
    console.error('❌ Direct OpenAI test failed:', error)
    
    return Response.json({
      error: error.message,
      code: error.code,
      type: error.type,
      api_key_info: {
        configured: !!process.env.OPENAI_API_KEY,
        prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 15) + '...' : 'NOT_SET',
        suffix: process.env.OPENAI_API_KEY ? '...' + process.env.OPENAI_API_KEY.slice(-8) : 'NOT_SET'
      }
    }, { status: 500 })
  }
}