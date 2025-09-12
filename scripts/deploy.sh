#!/bin/bash

# Script de déploiement pour Jaayma E-commerce
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="jaayma-ecommerce"

echo "🚀 Déploiement de $PROJECT_NAME en mode $ENVIRONMENT"

# Vérifier que les variables d'environnement sont définies
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local manquant"
    echo "📝 Créez un fichier .env.local avec vos variables Supabase"
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci

# Lancer les tests (si disponibles)
echo "🧪 Exécution des tests..."
npm run test --if-present

# Build de production
echo "🔨 Build de production..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Le build a échoué - dossier dist manquant"
    exit 1
fi

echo "✅ Build réussi!"

# Déploiement selon l'environnement
case $ENVIRONMENT in
    "staging")
        echo "🚀 Déploiement en staging..."
        # Ajouter ici la logique de déploiement staging
        ;;
    "production")
        echo "🚀 Déploiement en production..."
        # Ajouter ici la logique de déploiement production
        ;;
    *)
        echo "❌ Environnement non reconnu: $ENVIRONMENT"
        echo "Usage: $0 [staging|production]"
        exit 1
        ;;
esac

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Votre application est maintenant disponible"
