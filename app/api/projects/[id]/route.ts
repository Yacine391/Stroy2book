import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projectDb } from '@/lib/db';

// GET - Récupérer un projet spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const project = projectDb.findById(parseInt(id), session.userId);

    if (!project) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un projet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = projectDb.findById(parseInt(id), session.userId);
    if (!project) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour le projet
    projectDb.update(parseInt(id), session.userId, body);

    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = projectDb.findById(parseInt(id), session.userId);
    if (!project) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    // Supprimer le projet
    projectDb.delete(parseInt(id), session.userId);

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
