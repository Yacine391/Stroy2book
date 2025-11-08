/**
 * 🤖 SYSTÈME MULTI-IA
 * 
 * Ce fichier permet de basculer facilement entre différents fournisseurs d'IA :
 * - Google Gemini (gratuit, recommandé)
 * - OpenAI GPT-4 (payant, qualité maximale)
 * - Anthropic Claude (payant, bon équilibre)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Types
export type AIProvider = 'gemini' | 'openai' | 'claude';
export type AIAction = 'improve' | 'expand' | 'shorten' | 'simplify' | 'correct' | 'reformulate';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

// Configuration par défaut (peut être surchargée via .env.local)
export const DEFAULT_AI_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';

/**
 * Obtenir la configuration de l'IA active
 */
export function getAIConfig(): AIConfig {
  const provider = DEFAULT_AI_PROVIDER;

  switch (provider) {
    case 'gemini':
      return {
        provider: 'gemini',
        apiKey: process.env.GOOGLE_API_KEY || '',
        model: 'gemini-2.5-flash'
      };
    
    case 'openai':
      return {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4'
      };
    
    case 'claude':
      return {
        provider: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229'
      };
    
    default:
      return {
        provider: 'gemini',
        apiKey: process.env.GOOGLE_API_KEY || '',
        model: 'gemini-2.5-flash'
      };
  }
}

/**
 * Obtenir les instructions de style selon le style sélectionné
 */
function getStyleInstructions(style: string): string {
  const styleMap: Record<string, string> = {
    general: "Utilise un style équilibré, clair et accessible.",
    academic: "Adopte un ton formel et académique. Utilise un vocabulaire scientifique et des formulations rigoureuses.",
    creative: "Sois créatif et littéraire. Utilise des métaphores, des images poétiques et un style élégant.",
    professional: "Utilise un ton professionnel d'entreprise. Style formel mais accessible.",
    casual: "Adopte un ton décontracté et amical. Parle comme si tu conversais avec un ami.",
    storytelling: "Raconte comme un conteur d'histoires. Crée du suspense et de l'émotion.",
    poetic: "Utilise un style poétique et lyrique. Privilégie la beauté de la langue.",
    journalistic: "Adopte un style journalistique factuel et objectif. Va droit au but.",
    technical: "Sois précis et technique. Utilise le vocabulaire spécialisé approprié.",
    persuasive: "Sois convaincant et argumentatif. Structure ton propos pour persuader.",
    educational: "Explique de manière pédagogique et didactique. Rends le sujet facile à comprendre.",
    historical: "Adopte un style historique documenté. Contextualise les faits chronologiquement.",
    fantasy: "Écris dans un style merveilleux et épique. Crée un univers fantastique.",
    scifi: "Utilise un style science-fiction futuriste. Intègre des éléments technologiques.",
    romantic: "Adopte un ton romantique et émotionnel. Exprime les sentiments avec sensibilité.",
    humor: "Sois léger et amusant. Utilise l'humour avec subtilité.",
    mystery: "Crée du suspense et de l'intrigue. Maintiens le mystère.",
    philosophical: "Adopte un ton philosophique réflexif. Pose des questions profondes."
  };
  return styleMap[style] || styleMap.general;
}

/**
 * Construire le prompt selon l'action demandée, le style et le nombre de pages
 */
export function buildPrompt(action: AIAction, text: string, style: string = 'general', desiredPages?: number): string {
  const styleInstructions = getStyleInstructions(style);
  const pageInstructions = desiredPages 
    ? `\n12. IMPORTANT: L'utilisateur veut un ebook de ${desiredPages} pages. Génère environ ${desiredPages * 250} mots (250 mots par page). Développe suffisamment pour atteindre cette longueur.`
    : '';
  const langHint = `
RÈGLES STRICTES - TU DOIS ABSOLUMENT LES SUIVRE:
1. Conserve EXACTEMENT la langue d'origine du texte
2. ${styleInstructions}
3. GÉNÈRE LE CONTENU RÉEL ET COMPLET - PAS de méta-description comme "Je vais écrire..." ou "Voici ce que je vais faire..."
4. Retourne UNIQUEMENT le texte transformé, SANS préambule, SANS explication, SANS balises, SANS commentaires
5. Ne commence PAS par "Voici le texte..." ou "Le texte amélioré est..." ou "Je vais rédiger..."
6. NE DIS PAS ce que tu vas faire, FAIS-LE directement
7. INTERDICTION de décrire le processus ou le plan - GÉNÈRE le contenu final immédiatement
8. Retourne DIRECTEMENT le texte transformé, rien d'autre
9. INTERDICTION de mettre des balises HTML ou Markdown autour du texte
10. COMMENCE directement par le contenu transformé
11. GÉNÈRE un contenu UNIQUE et ORIGINAL - Seed: ${Date.now() + Math.random()}${pageInstructions}
`;

  const prompts: Record<AIAction, string> = {
    improve: `Tu es un écrivain professionnel. Améliore ce texte en gardant LE MÊME SENS et LA MÊME INTENTION que l'utilisateur.

RÈGLES STRICTES:
1. RESPECTE l'intention de l'utilisateur : si c'est une simple demande, reste simple
2. Améliore MODÉRÉMENT le style et la fluidité (pas de transformation radicale)
3. Corrige les erreurs grammaticales
4. N'ajoute PAS de vocabulaire ultra-académique sauf si le contexte l'exige
5. Garde le TON NATUREL du texte original
6. Développe légèrement SEULEMENT si c'est nécessaire pour la clarté
${langHint}

TEXTE À AMÉLIORER:
${text}

TEXTE AMÉLIORÉ (commence directement, sans introduction):`,

    expand: `Tu es un écrivain expert. Développe ce texte en ajoutant beaucoup plus de détails, d'exemples concrets, d'explications et de descriptions. Enrichis le contenu pour le rendre beaucoup plus complet et captivant. AUGMENTE le contenu d'au moins 100%.
${langHint}

TEXTE À DÉVELOPPER:
${text}

TEXTE DÉVELOPPÉ (commence directement):`,

    shorten: `Tu es un rédacteur expert. Condense ce texte en gardant uniquement les idées principales et essentielles. Réduis d'environ 30% tout en préservant le sens et la clarté.
${langHint}

TEXTE À CONDENSER:
${text}

TEXTE CONDENSÉ (commence directement):`,

    simplify: `Tu es un expert en vulgarisation. Simplifie ce texte pour le rendre très accessible et facile à comprendre. Utilise un vocabulaire simple, des phrases courtes et claires.
${langHint}

TEXTE À SIMPLIFIER:
${text}

TEXTE SIMPLIFIÉ (commence directement):`,

    correct: `Tu es un correcteur professionnel. Corrige toutes les erreurs de grammaire, d'orthographe, de ponctuation et de syntaxe dans ce texte. Ne change que ce qui est incorrect. Garde le style et le sens original.
${langHint}

TEXTE À CORRIGER:
${text}

TEXTE CORRIGÉ (commence directement):`,

    reformulate: `Tu es un rédacteur créatif. Réécris complètement ce texte avec un style totalement différent tout en gardant exactement le même message et les mêmes informations. Sois très créatif dans la reformulation.
${langHint}

TEXTE À REFORMULER:
${text}

TEXTE REFORMULÉ (commence directement):`
  };

  return prompts[action];
}

/**
 * Appeler Google Gemini
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const response = await result.response;
  return response.text();
}

/**
 * Appeler OpenAI GPT-4
 */
async function callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: apiKey
  });

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'Tu es un écrivain professionnel expert en transformation de texte.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 8192
  });

  return completion.choices[0].message.content || '';
}

/**
 * Appeler Anthropic Claude
 */
async function callClaude(prompt: string, apiKey: string, model: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: apiKey
  });

  const message = await anthropic.messages.create({
    model: model,
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

/**
 * Nettoyer la réponse de l'IA
 */
function cleanAIResponse(text: string): string {
  return text
    .replace(/^(Voici le texte.*?:|Le texte.*?est.*?:|Texte.*?:)\s*/i, '')
    .replace(/^```.*?\n/g, '')
    .replace(/\n```$/g, '')
    .trim();
}

/**
 * FONCTION PRINCIPALE : Générer du contenu avec l'IA configurée
 */
export async function generateWithAI(action: AIAction, text: string, style: string = 'general', desiredPages?: number): Promise<string> {
  const config = getAIConfig();

  console.log('🤖 Using AI provider:', config.provider, '- Model:', config.model, '- Style:', style, '- Desired pages:', desiredPages || 'not specified');

  if (!config.apiKey) {
    throw new Error(`Clé API manquante pour ${config.provider}. Configurez-la dans .env.local`);
  }

  // Construire le prompt avec le style et le nombre de pages
  const prompt = buildPrompt(action, text, style, desiredPages);

  let processedText: string;

  // Appeler le bon fournisseur
  switch (config.provider) {
    case 'gemini':
      processedText = await callGemini(prompt, config.apiKey);
      break;

    case 'openai':
      processedText = await callOpenAI(prompt, config.apiKey, config.model!);
      break;

    case 'claude':
      processedText = await callClaude(prompt, config.apiKey, config.model!);
      break;

    default:
      throw new Error(`Fournisseur IA non supporté: ${config.provider}`);
  }

  // Nettoyer la réponse
  return cleanAIResponse(processedText);
}

/**
 * Obtenir le nom complet du fournisseur actif
 */
export function getProviderName(): string {
  const provider = DEFAULT_AI_PROVIDER;
  const names = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT-4',
    claude: 'Anthropic Claude'
  };
  return names[provider] || provider;
}

/**
 * Vérifier si l'IA est correctement configurée
 */
export function isAIConfigured(): boolean {
  const config = getAIConfig();
  return !!config.apiKey && config.apiKey.length > 10;
}
