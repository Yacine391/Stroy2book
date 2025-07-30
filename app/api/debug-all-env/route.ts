export async function GET() {
  try {
    // Lister TOUTES les variables d'environnement qui contiennent "OPENAI"
    const allEnvVars = Object.keys(process.env).filter(key => 
      key.toUpperCase().includes('OPENAI') || 
      key.toUpperCase().includes('API') ||
      key.toUpperCase().includes('KEY')
    )
    
    const envDebug: Record<string, any> = {}
    
    allEnvVars.forEach(key => {
      const value = process.env[key]
      if (value && value.startsWith('sk-')) {
        envDebug[key] = {
          prefix: value.substring(0, 15) + '...',
          suffix: '...' + value.slice(-8),
          length: value.length
        }
      } else {
        envDebug[key] = value
      }
    })
    
    return Response.json({
      timestamp: new Date().toISOString(),
      total_env_vars: Object.keys(process.env).length,
      openai_related_vars: allEnvVars,
      env_details: envDebug,
      direct_access: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? {
          prefix: process.env.OPENAI_API_KEY.substring(0, 15) + '...',
          suffix: '...' + process.env.OPENAI_API_KEY.slice(-8),
          length: process.env.OPENAI_API_KEY.length
        } : 'NOT_SET'
      }
    })
    
  } catch (error: any) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}