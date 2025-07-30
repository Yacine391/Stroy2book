// Route API pour tester les variables d'environnement
export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  
  return Response.json({
    openai_configured: !!openaiKey,
    openai_prefix: openaiKey ? openaiKey.substring(0, 10) + '...' : 'NOT_SET',
    google_configured: !!googleKey,
    google_prefix: googleKey ? googleKey.substring(0, 10) + '...' : 'NOT_SET',
    timestamp: new Date().toISOString()
  });
}