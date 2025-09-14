# Configuration Supabase pour Jaayma

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez "Start your project"
3. Connectez-vous avec GitHub
4. Cliquez "New project"
5. Choisissez votre organisation
6. Nom du projet : `jaayma-ecommerce`
7. Mot de passe : (choisissez un mot de passe fort)
8. Région : (choisissez la plus proche)
9. Cliquez "Create new project"

## 2. Récupérer les variables d'environnement

1. Une fois le projet créé, allez dans Settings → API
2. Copiez :
   - **Project URL** : `https://abcdefghijklmnop.supabase.co`
   - **anon public** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Configurer sur Netlify

1. Allez sur [netlify.com](https://netlify.com) → Votre site
2. Site settings → Environment variables
3. Ajoutez/modifiez :
   ```
   VITE_SUPABASE_URL = https://votre-url.supabase.co
   VITE_SUPABASE_ANON_KEY = votre-clé-anonyme
   ```

## 4. Redéployer

1. Deploys → Trigger deploy → Deploy site
2. Attendez la fin du déploiement
3. Rafraîchissez votre site

## 5. Configurer la base de données

Exécutez les scripts SQL dans l'ordre :
1. `setup-admin-security.sql`
2. `add-20-products.sql`
3. `update-products-images.sql`
4. `update-categories-images.sql`
