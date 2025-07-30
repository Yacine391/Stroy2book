// Route API pour tester OpenAI uniquement
export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  return Response.json({
    status: 'OPENAI_ONLY',
    openai_configured: !!openaiKey,
    openai_prefix: openaiKey ? openaiKey.substring(0, 10) + '...' : 'NOT_SET',
    google_removed: true,
    message: 'Google Gemini completely removed - OpenAI only',
    timestamp: new Date().toISOString()
  });
}