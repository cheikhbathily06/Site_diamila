require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');
const { verifyEmailConfig } = require('./config/email');

/**
 * SERVER.JS - VERSION CORRIGÉE
 * 
 * Toutes les corrections ont été appliquées dans les routes et configurations
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à la base de données
connectDB();

// Vérifier la configuration email
setTimeout(() => {
  verifyEmailConfig();
}, 2000);

// Configuration du moteur de templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'denisia-bijoux-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 jours
  }
}));

// Middleware pour rendre le panier disponible dans toutes les vues
app.use((req, res, next) => {
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = res.locals.cart.length;
  next();
});

// Routes
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');

app.use('/', clientRoutes);
app.use(process.env.ADMIN_URL_PATH || '/admin', adminRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('client/error', {
    title: 'Page non trouvée',
    error: 'La page que vous recherchez n\'existe pas',
    logo: null,
    cart: req.session.cart || []
  });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).render('client/error', {
    title: 'Erreur serveur',
    error: 'Une erreur est survenue sur le serveur',
    logo: null,
    cart: req.session.cart || []
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║       🌟 DENISIA BIJOUX V2 🌟             ║
║          VERSION CORRIGÉE                  ║
║                                            ║
║  ✅ Toutes les corrections appliquées     ║
║                                            ║
║  Serveur démarré avec succès !            ║
║  URL: http://localhost:${PORT}              ║
║  Admin: http://localhost:${PORT}${process.env.ADMIN_URL_PATH || '/admin'}       ║
║                                            ║
║  📝 CORRECTIONS:                          ║
║  1. ✅ Upload images fonctionnel          ║
║  2. ✅ Validation commande corrigée       ║
║  3. ✅ Compte à rebours ajouté            ║
║  4. ✅ Paiement Wave intégré              ║
║  5. ✅ Emails automatiques activés        ║
║  6. ✅ Statut paiement visible admin      ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});

// Création d'un admin par défaut au premier démarrage
const Admin = require('./models/Admin');

const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    
    if (!adminExists) {
      const admin = new Admin({
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@denisiabijoux.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!',
        firstName: 'Admin',
        lastName: 'Denisia'
      });
      
      await admin.save();
      console.log('✅ Administrateur par défaut créé');
      console.log('   Email:', admin.email);
      console.log('   ⚠️  CHANGEZ le mot de passe après la première connexion !');
    }
  } catch (error) {
    console.error('Erreur création admin:', error);
  }
};

// Attendre que la connexion DB soit établie
setTimeout(createDefaultAdmin, 3000);

module.exports = app;
