import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-super-securise-changez-moi-en-production'
);

const COOKIE_NAME = 'hb-creator-session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours en secondes

export interface SessionPayload {
  userId: number;
  email: string;
}

// Créer un token JWT
export async function createJWT(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  
  return token;
}

// Vérifier et décoder un token JWT
export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      email: payload.email as string
    };
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
}

// Définir le cookie de session
export async function setSessionCookie(userId: number, email: string) {
  const token = await createJWT({ userId, email });
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
  
  return token;
}

// Récupérer la session depuis le cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyJWT(token);
}

// Supprimer le cookie de session
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Middleware pour vérifier l'authentification
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Non authentifié');
  }
  
  return session;
}
