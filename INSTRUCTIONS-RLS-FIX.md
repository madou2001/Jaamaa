# 🔐 Correction du problème RLS (Row Level Security)

## ❌ Problème
```
Error 42501: new row violates row-level security policy for table "profiles"
```

## ✅ Solution

### Étape 1 : Aller dans Supabase Dashboard
1. Connectez-vous à https://supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**

### Étape 2 : Exécuter le script SQL
Copiez-collez le contenu du fichier `fix-rls-policies.sql` et exécutez-le.

### Étape 3 : Vérifier les politiques
Les politiques suivantes seront créées :

#### Pour la table `profiles` :
- ✅ **Lecture** : Utilisateurs peuvent lire leur propre profil
- ✅ **Création** : Utilisateurs peuvent créer leur propre profil  
- ✅ **Modification** : Utilisateurs peuvent modifier leur propre profil

#### Pour la table `addresses` :
- ✅ **CRUD complet** : Utilisateurs peuvent gérer leurs propres adresses

#### Pour la table `orders` :
- ✅ **Lecture/Création** : Utilisateurs peuvent voir et créer leurs commandes

#### Pour la table `order_items` :
- ✅ **Lecture/Création** : Liée aux commandes de l'utilisateur

#### Pour les tables publiques :
- ✅ **products** : Lecture publique autorisée
- ✅ **categories** : Lecture publique autorisée

## 🔧 Code modifié
Le code a été modifié pour :
- ✅ **Debug amélioré** : Logs détaillés pour diagnostiquer
- ✅ **Gestion d'erreur RLS** : Message spécifique pour l'erreur 42501
- ✅ **Vérification profil** : Check si le profil existe avant upsert

## 🎯 Résultat attendu
Après avoir exécuté le script SQL, le profil utilisateur pourra être sauvegardé sans erreur RLS.

## 🚨 Note importante
Si vous voyez toujours des erreurs après avoir exécuté le script :
1. Vérifiez que l'utilisateur est bien connecté
2. Regardez les logs dans la console du navigateur
3. Vérifiez que les politiques ont bien été créées dans Supabase
