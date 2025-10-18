import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectDb, subscriptionDb } from '@/lib/db';

// GET - Récupérer tous les projets de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const projects = projectDb.findByUserId(session.userId);

    return NextResponse.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau projet
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
    const { title, author, content, coverData, layoutSettings, illustrationsData } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    // Vérifier les limites de l'abonnement
    const subscription = subscriptionDb.findByUserId(session.userId);
    if (subscription && subscription.used_ebooks >= subscription.monthly_ebooks) {
      return NextResponse.json(
        { error: 'Limite d\'ebooks atteinte pour votre plan' },
        { status: 403 }
      );
    }

    // Créer le projet
    const projectId = projectDb.create(session.userId, {
      title,
      author,
      content,
      coverData,
      layoutSettings,
      illustrationsData
    });

    // Incrémenter le compteur d'ebooks
    subscriptionDb.incrementUsage(session.userId, 'ebooks');

    return NextResponse.json({
      success: true,
      projectId
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
