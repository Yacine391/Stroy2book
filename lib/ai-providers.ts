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
import Groq from 'groq-sdk';

// Types
export type AIProvider = 'gemini' | 'openai' | 'claude' | 'groq';
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
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' // Modèle par défaut changé pour plus de stabilité
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
    
    case 'groq':
      return {
        provider: 'groq',
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
      };
    
    default:
      return {
        provider: 'groq',
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
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
    training_guide: "Écris comme un guide de formation pratique. Structure en étapes claires et numérotées. Inclus des objectifs, des exercices pratiques, des exemples concrets et des points de vérification. Utilise un ton instructif mais encourageant. Format: Introduction → Objectifs → Étapes détaillées → Pratique → Résumé.",
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
    ? `\n12. IMPÉRATIF ABSOLU NON NÉGOCIABLE: L'utilisateur veut EXACTEMENT ${desiredPages} pages. Tu DOIS générer AU MINIMUM ${desiredPages * 300} mots (300 mots/page). OBJECTIF: ${desiredPages * 300} MOTS MINIMUM. Si tu génères moins, c'est un ÉCHEC TOTAL. DÉVELOPPE AU MAXIMUM: ajoute des chapitres détaillés, des sous-sections, des exemples concrets, du contexte historique/culturel complet, des anecdotes, des descriptions, des analyses approfondies. MULTIPLIE par 3-5 le contenu jusqu'à atteindre ${desiredPages * 300} mots ABSOLUMENT. NE SOIS JAMAIS CONCIS, DÉVELOPPE TOUT AU MAXIMUM.`
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

    expand: `Tu es un écrivain expert. Développe ce texte de manière TRÈS SUBSTANTIELLE en ajoutant énormément de détails, d'exemples concrets, d'explications approfondies, de descriptions riches, d'anecdotes, de contexte historique/scientifique/culturel selon le sujet. 

IMPORTANT: MULTIPLIE la longueur par 3 à 5 minimum. Si le texte fait 200 mots, génère 600-1000 mots. Développe CHAQUE idée en profondeur. N'hésite pas à être long et détaillé.
${langHint}

TEXTE À DÉVELOPPER:
${text}

TEXTE DÉVELOPPÉ ET TRÈS ENRICHI (commence directement):`,

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
 * Liste des modèles Gemini disponibles (par ordre de préférence)
 */
const GEMINI_MODELS = [
  'gemini-1.5-flash',      // Modèle stable et rapide
  'gemini-1.5-pro',        // Modèle plus puissant
  'gemini-pro',            // Modèle classique
];

/**
 * Fonction helper pour attendre (sleep)
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Appeler Google Gemini avec retry automatique et fallback de modèles
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Tenter avec plusieurs modèles en cas d'échec
  for (let modelIndex = 0; modelIndex < GEMINI_MODELS.length; modelIndex++) {
    const modelName = GEMINI_MODELS[modelIndex];
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Retry avec backoff exponentiel (3 tentatives par modèle)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🤖 Tentative ${attempt}/3 avec modèle: ${modelName}`);
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384,
          },
        });

        const response = await result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error('L\'API Gemini a retourné une réponse vide');
        }
        
        console.log(`✅ Succès avec ${modelName} (tentative ${attempt})`);
        return text;
        
      } catch (error: any) {
        const isLastAttempt = attempt === 3;
        const isLastModel = modelIndex === GEMINI_MODELS.length - 1;
        const errorMsg = error.message || 'Erreur inconnue';
        
        console.error(`❌ Erreur ${modelName} (tentative ${attempt}/3):`, errorMsg);
        
        // Erreur 503 (Service Unavailable / Overloaded)
        if (errorMsg.includes('503') || errorMsg.includes('overloaded')) {
          if (isLastAttempt && isLastModel) {
            throw new Error('Le service Google Gemini est temporairement surchargé. Veuillez réessayer dans 1-2 minutes ou basculer sur OpenAI/Claude dans les paramètres.');
          }
          
          if (!isLastAttempt) {
            // Attendre avant de réessayer (backoff exponentiel: 2s, 4s, 8s)
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`⏳ Modèle surchargé, nouvelle tentative dans ${waitTime/1000}s...`);
            await sleep(waitTime);
            continue; // Réessayer avec le même modèle
          } else {
            // Passer au modèle suivant
            console.log(`🔄 Passage au modèle suivant: ${GEMINI_MODELS[modelIndex + 1]}`);
            break; // Sortir de la boucle de retry pour essayer le modèle suivant
          }
        }
        
        // Autres erreurs
        if (errorMsg.includes('timeout')) {
          throw new Error('Timeout: La génération a pris trop de temps. Essayez avec un texte plus court ou réessayez.');
        }
        if (errorMsg.includes('429')) {
          throw new Error('Quota API dépassé. Attendez quelques minutes ou créez une nouvelle clé API.');
        }
        if (errorMsg.includes('403') || errorMsg.includes('401')) {
          throw new Error('Clé API invalide ou expirée. Vérifiez votre clé dans .env.local');
        }
        
        // Si dernière tentative du dernier modèle, propager l'erreur
        if (isLastAttempt && isLastModel) {
          throw new Error(`Erreur Gemini: ${errorMsg}`);
        }
        
        // Attendre avant de réessayer
        if (!isLastAttempt) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await sleep(waitTime);
        }
      }
    }
  }
  
  throw new Error('Tous les modèles Gemini ont échoué. Veuillez réessayer plus tard.');
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
 * Appeler Groq (Llama 3.1)
 */
async function callGroq(prompt: string, apiKey: string, model: string): Promise<string> {
  const groq = new Groq({
    apiKey: apiKey
  });

  try {
    const completion = await groq.chat.completions.create({
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
      max_tokens: 8192,
      top_p: 0.95,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('❌ Groq API Error:', error);
    if (error.message?.includes('429')) {
      throw new Error('Quota Groq dépassé (30 req/min). Attendez quelques secondes.');
    }
    if (error.message?.includes('401') || error.message?.includes('403')) {
      throw new Error('Clé API Groq invalide. Vérifiez votre clé dans .env.local');
    }
    throw new Error(`Erreur Groq: ${error.message || 'Erreur inconnue'}`);
  }
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

    case 'groq':
      processedText = await callGroq(prompt, config.apiKey, config.model!);
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
    claude: 'Anthropic Claude',
    groq: 'Groq (Llama 3.1)'
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
