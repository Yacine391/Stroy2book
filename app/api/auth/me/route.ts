import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { userDb, subscriptionDb } from '@/lib/db-simple';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les données utilisateur
    const user = await userDb.findById(session.userId as any);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Récupérer l'abonnement
    const subscription = await subscriptionDb.findByUserId(user.id as any);

    // Retourner les données (sans le hash du mot de passe)
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      subscription: subscription || null
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
