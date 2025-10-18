import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { subscriptionDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Validation du plan
    if (!['free', 'premium', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour le plan
    subscriptionDb.updatePlan(session.userId, plan);

    // Récupérer l'abonnement mis à jour
    const subscription = subscriptionDb.findByUserId(session.userId);

    return NextResponse.json({
      success: true,
      subscription
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du plan:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du plan' },
      { status: 500 }
    );
  }
}
