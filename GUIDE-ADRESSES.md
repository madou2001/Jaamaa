# 📍 Guide des Adresses - Système Complet

## ✅ Fonctionnalités Implémentées

### 🏗️ **Composants Créés :**
1. **`AddressForm.tsx`** - Formulaire modal pour ajouter/modifier les adresses
2. **`useAddresses.ts`** - Hook pour gérer les adresses utilisateur
3. **Intégration Profile** - Section adresses complète dans le profil

### 🎯 **Fonctionnalités :**
- ✅ **Ajout d'adresses** - Formulaire complet avec validation
- ✅ **Modification d'adresses** - Edition en place
- ✅ **Suppression d'adresses** - Avec confirmation
- ✅ **Adresse par défaut** - Gestion automatique (une seule par utilisateur)
- ✅ **Types d'adresses** - Domicile, Travail, Autre
- ✅ **Sauvegarde Supabase** - Persistance en base de données
- ✅ **Fallback localStorage** - Fonctionnement hors ligne
- ✅ **Chargement/États** - UI responsive avec indicateurs

## 🗃️ **Structure Base de Données**

### **Table `addresses` :**
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY vers auth.users)
- type (TEXT: 'shipping', 'billing', 'home', 'work', 'other')
- first_name (TEXT)
- last_name (TEXT)
- company (TEXT, optionnel)
- address_line_1 (TEXT)
- address_line_2 (TEXT, optionnel)
- city (TEXT)
- state (TEXT, optionnel)
- postal_code (TEXT)
- country (TEXT)
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔧 **Installation/Configuration**

### **1. Exécuter les scripts SQL :**
```bash
# Dans Supabase SQL Editor :
1. fix-rls-policies.sql        # Politiques de sécurité
2. update-addresses-table.sql  # Colonnes manquantes + triggers
```

### **2. Fonctionnalités automatiques :**
- **Trigger** - Une seule adresse par défaut par utilisateur
- **Index** - Performance optimisée pour les requêtes
- **RLS** - Sécurité par utilisateur

## 🎮 **Utilisation**

### **Dans le Profil utilisateur :**
1. **Onglet "Mes Adresses"**
2. **Bouton "Ajouter une adresse"** → Ouvre le modal
3. **Modifier/Supprimer** → Actions directes sur chaque adresse
4. **Adresse par défaut** → Checkbox automatique

### **Hook useAddresses :**
```typescript
const { 
  addresses, 
  loading, 
  getDefaultAddress, 
  getShippingAddresses,
  getBillingAddresses 
} = useAddresses()
```

## 🚀 **Intégration Checkout**

Les adresses peuvent maintenant être utilisées dans le checkout :

```typescript
// Récupérer l'adresse par défaut
const defaultAddress = getDefaultAddress()

// Pré-remplir le formulaire de livraison
if (defaultAddress) {
  setShippingInfo({
    firstName: defaultAddress.firstName,
    lastName: defaultAddress.lastName,
    address: defaultAddress.address,
    city: defaultAddress.city,
    postalCode: defaultAddress.postalCode,
    country: defaultAddress.country
  })
}
```

## 🔐 **Sécurité**

- ✅ **RLS activé** - Chaque utilisateur ne voit que ses adresses
- ✅ **Validation frontend** - Champs requis
- ✅ **Validation backend** - Contraintes SQL
- ✅ **Triggers** - Cohérence des données

## 🎯 **Avantages pour les Commandes**

1. **🚀 Checkout accéléré** - Adresses pré-remplies
2. **📱 Multi-device** - Synchronisation entre appareils
3. **🏠 Gestion multiple** - Domicile, travail, etc.
4. **⚡ Performance** - Index optimisés
5. **🔄 Fallback** - Fonctionnement même hors ligne

## 🧪 **Test**

1. **Connectez-vous** à votre compte
2. **Allez dans "Profil" → "Mes Adresses"**
3. **Ajoutez une adresse** - Testez le formulaire
4. **Définissez comme par défaut** - Vérifiez l'unicité
5. **Modifiez/Supprimez** - Testez les actions
6. **Rechargez la page** - Vérifiez la persistance

**Les adresses sont maintenant complètement fonctionnelles ! 🎉**
