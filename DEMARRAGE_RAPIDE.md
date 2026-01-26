# ⚡ DÉMARRAGE RAPIDE - DENISIA BIJOUX V2

## 🎯 Installation en 5 minutes

### 1. Extraire et installer
```bash
unzip siteamala1.zip
cd siteamala1
npm install
```

### 2. Configurer MongoDB

**Option A - Local:**
```env
MONGODB_URI=mongodb://localhost:27017/denisia_bijoux
```

**Option B - Atlas (gratuit):**
1. https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit
3. Copiez l'URL dans `.env`

### 3. Configurer email (optionnel au début)

```env
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=mot_de_passe_application
```

### 4. Lancer
```bash
npm start
```

---

## ✅ VÉRIFICATIONS RAPIDES

### Upload d'images ✅
1. Admin → Produits → Ajouter
2. Uploadez une image
3. ✅ Elle doit apparaître

### Commande ✅
1. Ajoutez au panier
2. Passez commande
3. ✅ Confirmation sans erreur

### Compte à rebours ✅
1. Créez un bracelet personnalisé
2. Cochez "Compte à rebours"
3. ✅ Visible avant 17h

### Wave ✅
1. Produit personnalisé → panier
2. ✅ Seul Wave disponible
3. ✅ Redirection vers page Wave

### Emails ✅
1. Passez une commande
2. ✅ Email client reçu
3. ✅ Email admin reçu

### Statut paiement ✅
1. Admin → Commandes
2. ✅ Badges colorés visibles

---

## 🔑 Identifiants

**Admin:**
- URL: http://localhost:3000/admin
- Email: admin@denisiabijoux.com
- Password: Admin123!

---

## 📝 Données de test

```javascript
// Dans mongosh
use denisia_bijoux

// Zones
db.deliveryzones.insertMany([
  {name:"Dakar Centre",price:1000,isActive:true,createdAt:new Date(),updatedAt:new Date()},
  {name:"Pikine",price:2500,isActive:true,createdAt:new Date(),updatedAt:new Date()}
])

// Produit
db.products.insertOne({
  name:"Bracelet Personnalisé",
  description:"Avec gravure",
  price:25000,
  images:[],
  category:"bracelet_personnalise",
  isPersonalized:true,
  maxCharacters:20,
  hasCountdown:true,
  stock:50,
  inStock:true,
  isActive:true,
  createdAt:new Date(),
  updatedAt:new Date()
})
```

---

## 🎉 C'est prêt !

**Site:** http://localhost:3000
**Admin:** http://localhost:3000/admin

Toutes les corrections sont appliquées ! 🚀
