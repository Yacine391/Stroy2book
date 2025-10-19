import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { sessionDb } from '@/lib/db-simple';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (session) {
      // Nettoyer les sessions de la base de données
      sessionDb.deleteByUserId(session.userId as any);
    }

    // Supprimer le cookie
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
