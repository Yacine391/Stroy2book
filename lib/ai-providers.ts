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
 * Construire le prompt selon l'action demandée
 */
export function buildPrompt(action: AIAction, text: string): string {
  const langHint = `
RÈGLES STRICTES - TU DOIS ABSOLUMENT LES SUIVRE:
1. Conserve EXACTEMENT la langue d'origine du texte
2. Retourne UNIQUEMENT le texte transformé, SANS préambule, SANS explication, SANS balises, SANS commentaires
3. Ne commence PAS par "Voici le texte..." ou "Le texte amélioré est..."
4. Retourne DIRECTEMENT le texte transformé, rien d'autre
5. INTERDICTION de mettre des balises HTML ou Markdown autour du texte
6. COMMENCE directement par le contenu transformé
`;

  const prompts: Record<AIAction, string> = {
    improve: `Tu es un écrivain professionnel. Améliore ce texte en enrichissant le style, en développant les idées, en améliorant la fluidité et en corrigeant les erreurs. Garde le même sens mais rends-le beaucoup plus captivant, professionnel et détaillé. DÉVELOPPE le contenu pour qu'il soit plus riche et complet.
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
export async function generateWithAI(action: AIAction, text: string): Promise<string> {
  const config = getAIConfig();

  console.log('🤖 Using AI provider:', config.provider, '- Model:', config.model);

  if (!config.apiKey) {
    throw new Error(`Clé API manquante pour ${config.provider}. Configurez-la dans .env.local`);
  }

  // Construire le prompt
  const prompt = buildPrompt(action, text);

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
