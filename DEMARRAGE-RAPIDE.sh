#!/bin/bash

# 🚀 SCRIPT DE DÉMARRAGE RAPIDE - HB Creator
# Usage: ./DEMARRAGE-RAPIDE.sh VOTRE_CLE_API

echo ""
echo "🚀 DÉMARRAGE RAPIDE - HB Creator"
echo "=================================="
echo ""

# Vérifier que la clé API est fournie
if [ -z "$1" ]; then
    echo "❌ ERREUR: Vous devez fournir une clé API"
    echo ""
    echo "Usage:"
    echo "  ./DEMARRAGE-RAPIDE.sh VOTRE_CLE_API"
    echo ""
    echo "Exemple:"
    echo "  ./DEMARRAGE-RAPIDE.sh AIzaSyC1qilwIQEDwfF6B4LLKq7kB9h4oJKzlCo"
    echo ""
    echo "Pour obtenir une clé gratuite (5 min):"
    echo "  👉 https://aistudio.google.com/app/apikey"
    echo ""
    exit 1
fi

API_KEY="$1"

# Vérifier le format de la clé
if [[ ! "$API_KEY" =~ ^AIza ]]; then
    echo "⚠️  ATTENTION: La clé ne commence pas par 'AIza'"
    echo "   Êtes-vous sûr que c'est une clé Google Gemini ?"
    echo ""
    read -p "Continuer quand même ? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Clé API détectée: ${API_KEY:0:10}...${API_KEY: -5}"
echo ""

# Étape 1: Créer .env.local
echo "📝 Étape 1/4: Création de .env.local..."
cat > .env.local << EOF
# Configuration HB Creator
# Générée automatiquement le $(date)

# Provider IA (gemini, openai, ou claude)
AI_PROVIDER=gemini

# Clé API Google Gemini
GOOGLE_API_KEY=$API_KEY

# Optionnel: Clés pour autres providers
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4
# ANTHROPIC_API_KEY=sk-ant-...
# CLAUDE_MODEL=claude-3-sonnet-20240229

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF

if [ -f .env.local ]; then
    echo "✅ Fichier .env.local créé avec succès"
else
    echo "❌ Erreur lors de la création de .env.local"
    exit 1
fi
echo ""

# Étape 2: Tester la clé API
echo "🧪 Étape 2/4: Test de la clé API..."
echo ""

if [ -f test-api-simple.js ]; then
    if node test-api-simple.js "$API_KEY"; then
        echo ""
        echo "✅ Test API réussi !"
    else
        echo ""
        echo "❌ Le test API a échoué"
        echo ""
        echo "Causes possibles:"
        echo "  - Clé API invalide ou expirée"
        echo "  - Quota dépassé"
        echo "  - Problème de connexion internet"
        echo ""
        echo "Solutions:"
        echo "  1. Vérifiez votre clé sur https://aistudio.google.com/app/apikey"
        echo "  2. Créez une nouvelle clé si nécessaire"
        echo "  3. Réessayez dans quelques minutes"
        echo ""
        exit 1
    fi
else
    echo "⚠️  Script de test non trouvé, passage à l'étape suivante"
fi
echo ""

# Étape 3: Vérifier les dépendances
echo "📦 Étape 3/4: Vérification des dépendances..."

if [ ! -d node_modules ]; then
    echo "⚠️  node_modules manquant, installation en cours..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées"
else
    echo "✅ Dépendances déjà installées"
fi
echo ""

# Étape 4: Informations de démarrage
echo "🎉 Étape 4/4: Configuration terminée !"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TOUT EST PRÊT !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Pour démarrer l'application:"
echo ""
echo "  npm run dev"
echo ""
echo "Puis ouvrez votre navigateur sur:"
echo ""
echo "  👉 http://localhost:3001"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation disponible:"
echo "  - LISEZ-MOI-EN-PREMIER.md"
echo "  - RESUME-RAPIDE-REPRISE.md"
echo "  - GUIDE-CLE-API-COMPLET.md"
echo ""
echo "🧪 Scripts de test:"
echo "  - node test-api-simple.js VOTRE_CLE"
echo "  - node test-ai-action.js"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Voulez-vous démarrer l'application maintenant ?"
echo ""
read -p "Démarrer ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Démarrage de l'application..."
    echo ""
    npm run dev
else
    echo ""
    echo "OK ! Lancez quand vous voulez avec: npm run dev"
    echo ""
fi
