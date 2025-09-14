# 🔐 Configuration Google OAuth pour Jaayma E-commerce

## 📋 **GUIDE DE CONFIGURATION COMPLET**

### **1️⃣ Configuration Google Cloud Console**

#### **Créer un projet Google Cloud :**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un existant
3. Nom suggéré : `jaayma-ecommerce-oauth`

#### **Activer Google+ API :**
1. Dans le menu, aller à **APIs & Services** > **Library**
2. Rechercher "Google+ API" 
3. Cliquer sur **Enable**

#### **Configurer OAuth Consent Screen :**
1. Aller à **APIs & Services** > **OAuth consent screen**
2. Choisir **External** (pour tous les utilisateurs)
3. Remplir les informations :
   ```
   App name: Jaayma E-commerce
   User support email: support@jaayma-ecommerce.com
   Developer contact: dev@jaayma-ecommerce.com
   App domain: https://votre-domaine.com
   ```
4. Ajouter les scopes :
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

#### **Créer les identifiants OAuth :**
1. Aller à **APIs & Services** > **Credentials**
2. Cliquer **Create Credentials** > **OAuth 2.0 Client IDs**
3. Type d'application : **Web application**
4. Nom : `Jaayma E-commerce Web Client`
5. **Origines JavaScript autorisées :**
   ```
   http://localhost:5173
   https://votre-domaine.com
   ```
6. **URIs de redirection autorisés :**
   ```
   https://votre-projet.supabase.co/auth/v1/callback
   ```

#### **Récupérer les clés :**
- ✅ **Client ID** : `1234567890-abc123.apps.googleusercontent.com`
- ✅ **Client Secret** : `GOCSPX-abc123def456`

---

### **2️⃣ Configuration Supabase**

#### **Dans le Dashboard Supabase :**
1. Aller à **Authentication** > **Providers**
2. Activer **Google**
3. Entrer les informations :
   ```
   Client ID: [Votre Client ID Google]
   Client Secret: [Votre Client Secret Google]
   ```
4. **Redirect URL** (à copier) : `https://votre-projet.supabase.co/auth/v1/callback`

#### **Variables d'environnement (.env) :**
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=1234567890-abc123.apps.googleusercontent.com
```

---

### **3️⃣ Configuration des domaines**

#### **Domaines autorisés dans Supabase :**
1. **Authentication** > **URL Configuration**
2. **Site URL** : `http://localhost:5173` (dev) / `https://votre-domaine.com` (prod)
3. **Redirect URLs** :
   ```
   http://localhost:5173/auth/callback
   https://votre-domaine.com/auth/callback
   ```

---

### **4️⃣ Test de la configuration**

#### **Vérifications :**
- ✅ Google Cloud Console configuré
- ✅ Supabase Provider activé
- ✅ Domaines ajoutés partout
- ✅ Variables d'environnement définies

#### **URLs de test :**
- **Dev** : `http://localhost:5173`
- **Callback** : `https://votre-projet.supabase.co/auth/v1/callback`

---

## 🚨 **POINTS CRITIQUES**

### **⚠️ Erreurs courantes :**
1. **Domaines non ajoutés** dans Google Cloud Console
2. **Redirect URI incorrect** dans Supabase
3. **Client Secret manquant** dans Supabase
4. **Variables d'environnement** non définies

### **✅ Checklist finale :**
- [ ] Projet Google Cloud créé
- [ ] OAuth Consent Screen configuré
- [ ] Identifiants OAuth créés
- [ ] Google Provider activé dans Supabase
- [ ] Client ID/Secret ajoutés dans Supabase
- [ ] Domaines autorisés partout
- [ ] Variables d'environnement définies
- [ ] Test de connexion réussi

---

## 🎯 **APRÈS CONFIGURATION**

Une fois cette configuration terminée, l'implémentation frontend fonctionnera automatiquement avec :
- Bouton "Se connecter avec Google"
- Création automatique de profil
- Synchronisation des données utilisateur
- Expérience utilisateur fluide

**⏱️ Temps estimé de configuration : 15-20 minutes**


