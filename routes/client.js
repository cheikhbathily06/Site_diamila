const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryZone = require('../models/DeliveryZone');
const Page = require('../models/Page');
const { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } = require('../config/email');

/**
 * ROUTES CLIENT - VERSION CORRIGÉE
 * 
 * CORRECTIONS APPLIQUÉES:
 * - CORRECTION 2: Gestion d'erreur robuste pour la validation de commande
 * - CORRECTION 3: Ajout du compte à rebours pour bracelets personnalisés
 * - CORRECTION 4: Remplacement PayTech par Wave
 * - CORRECTION 5: Envoi automatique d'emails
 */

// Page d'accueil
router.get('/', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const featuredProducts = await Product.find({ isActive: true, inStock: true })
      .sort({ createdAt: -1 })
      .limit(8);
    
    res.render('client/home', {
      title: 'Accueil - Denisia Bijoux',
      products: featuredProducts,
      logo: logoPage?.logo || null,
      cart: req.session.cart || []
    });
  } catch (error) {
    console.error('Erreur page d\'accueil:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement de la page',
      logo: null,
      cart: []
    });
  }
});

// Page boutique
router.get('/boutique', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const category = req.query.category || 'all';
    
    let query = { isActive: true };
    if (category !== 'all') {
      query.category = category;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.render('client/shop', {
      title: 'Boutique - Denisia Bijoux',
      products,
      category,
      logo: logoPage?.logo || null,
      cart: req.session.cart || []
    });
  } catch (error) {
    console.error('Erreur page boutique:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement de la boutique',
      logo: null,
      cart: []
    });
  }
});

// Fiche produit
router.get('/produit/:id', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).render('client/error', { 
        error: 'Produit non trouvé',
        logo: null,
        cart: []
      });
    }
    
    /**
     * MODIFICATION 2: Calcul du compte à rebours pour tous les bijoux personnalisés
     * 
     * Logique corrigée:
     * - Si isPersonalized = true ET hasCountdown = true
     * - ET heure actuelle < 17h
     * - Alors afficher le compte à rebours jusqu'à 17h
     * 
     * Le compte à rebours s'affiche pour TOUS les produits personnalisés,
     * pas seulement la catégorie bracelet_personnalise
     */
    const now = new Date();
    const currentHour = now.getHours();
    let showCountdown = false;
    let countdownDeadline = null;
    
    console.log('🔍 Produit:', product.name);
    console.log('   - isPersonalized:', product.isPersonalized);
    console.log('   - hasCountdown:', product.hasCountdown);
    console.log('   - Heure actuelle:', currentHour);
    
    // MODIFICATION 2: Vérifier isPersonalized au lieu de la catégorie
    if (product.isPersonalized && product.hasCountdown && currentHour < 17) {
      showCountdown = true;
      countdownDeadline = new Date(now);
      countdownDeadline.setHours(17, 0, 0, 0);
      console.log('✅ Compte à rebours activé jusqu\'à:', countdownDeadline);
    } else {
      console.log('❌ Compte à rebours NON activé. Raisons:');
      if (!product.isPersonalized) console.log('   - Produit non personnalisé');
      if (!product.hasCountdown) console.log('   - hasCountdown désactivé');
      if (currentHour >= 17) console.log('   - Trop tard (après 17h)');
    }
    
    res.render('client/product', {
      title: `${product.name} - Denisia Bijoux`,
      product,
      showCountdown,
      countdownDeadline: countdownDeadline ? countdownDeadline.toISOString() : null,
      logo: logoPage?.logo || null,
      cart: req.session.cart || []
    });
  } catch (error) {
    console.error('Erreur fiche produit:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement du produit',
      logo: null,
      cart: []
    });
  }
});

// Panier
router.get('/panier', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const cart = req.session.cart || [];
    
    res.render('client/cart', {
      title: 'Panier - Denisia Bijoux',
      cart,
      logo: logoPage?.logo || null
    });
  } catch (error) {
    console.error('Erreur page panier:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement du panier',
      logo: null,
      cart: []
    });
  }
});

// Ajouter au panier
router.post('/panier/ajouter', async (req, res) => {
  try {
    const { productId, quantity, personalizationText } = req.body;
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive || !product.inStock) {
      return res.json({ success: false, message: 'Produit non disponible' });
    }
    
    if (product.stock < quantity) {
      return res.json({ success: false, message: 'Stock insuffisant' });
    }
    
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    const existingItemIndex = req.session.cart.findIndex(item => 
      item.productId === productId && 
      item.personalizationText === personalizationText
    );
    
    if (existingItemIndex > -1) {
      req.session.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        productId,
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity),
        image: product.images[0] || null,
        isPersonalized: product.isPersonalized,
        personalizationText: personalizationText || null,
        category: product.category
      });
    }
    
    res.json({ success: true, cartCount: req.session.cart.length });
  } catch (error) {
    console.error('Erreur ajout panier:', error);
    res.json({ success: false, message: 'Erreur lors de l\'ajout au panier' });
  }
});

// Mettre à jour le panier
router.post('/panier/update', (req, res) => {
  try {
    const { index, quantity } = req.body;
    
    if (req.session.cart && req.session.cart[index]) {
      req.session.cart[index].quantity = parseInt(quantity);
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Article non trouvé' });
    }
  } catch (error) {
    console.error('Erreur mise à jour panier:', error);
    res.json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
});

// Supprimer du panier
router.post('/panier/supprimer', (req, res) => {
  try {
    const { index } = req.body;
    
    if (req.session.cart && req.session.cart[index] !== undefined) {
      req.session.cart.splice(index, 1);
      res.json({ success: true, cartCount: req.session.cart.length });
    } else {
      res.json({ success: false, message: 'Article non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression panier:', error);
    res.json({ success: false, message: 'Erreur lors de la suppression' });
  }
});

// Page de paiement
router.get('/paiement', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
      return res.redirect('/panier');
    }
    
    const deliveryZones = await DeliveryZone.find({ isActive: true });
    
    res.render('client/checkout', {
      title: 'Paiement - Denisia Bijoux',
      cart,
      deliveryZones,
      logo: logoPage?.logo || null
    });
  } catch (error) {
    console.error('Erreur page paiement:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement de la page de paiement',
      logo: null,
      cart: []
    });
  }
});

/**
 * CORRECTION 2: Traiter la commande - VERSION CORRIGÉE
 * 
 * Problèmes corrigés:
 * - Validation robuste de toutes les données
 * - Gestion d'erreur complète
 * - Vérification du stock avant confirmation
 * - Calcul correct des dates de livraison
 */
router.post('/commander', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, deliveryZone, paymentMethod } = req.body;
    const cart = req.session.cart || [];
    
    // Validation: panier vide
    if (cart.length === 0) {
      return res.json({ success: false, message: 'Votre panier est vide' });
    }
    
    // Validation: tous les champs requis
    if (!firstName || !lastName || !email || !phone || !address || !deliveryZone || !paymentMethod) {
      return res.json({ success: false, message: 'Tous les champs sont obligatoires' });
    }
    
    // Récupérer la zone de livraison
    const zone = await DeliveryZone.findById(deliveryZone);
    if (!zone) {
      return res.json({ success: false, message: 'Zone de livraison invalide' });
    }
    
    // Calculer les totaux et vérifier les stocks
    let subtotal = 0;
    const orderItems = [];
    let hasPersonalizedProduct = false;
    let hasExpressEligible = false;
    
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      
      // Vérifier la disponibilité du produit
      if (!product || !product.isActive) {
        return res.json({ 
          success: false, 
          message: `Le produit ${item.name} n'est plus disponible` 
        });
      }
      
      // Vérifier le stock
      if (product.stock < item.quantity) {
        return res.json({ 
          success: false, 
          message: `Stock insuffisant pour ${item.name}. Disponible: ${product.stock}` 
        });
      }
      
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        isPersonalized: product.isPersonalized,
        personalizationText: item.personalizationText || null,
        subtotal: itemSubtotal
      });
      
      if (product.isPersonalized) {
        hasPersonalizedProduct = true;
      }
      
      // Vérifier l'éligibilité à la livraison express
      const now = new Date();
      const currentHour = now.getHours();
      
      if (product.category === 'bracelet_personnalise' && currentHour < 17) {
        hasExpressEligible = true;
      } else if ((product.category === 'bracelet_simple' || product.category === 'bijou') && currentHour < 20) {
        hasExpressEligible = true;
      }
      
      // NE PLUS décrémenter le stock ici
      // Le stock sera décrémenté APRÈS la création de la commande
    }
    
    // Vérifier que le paiement en ligne est utilisé pour les produits personnalisés
    if (hasPersonalizedProduct && paymentMethod !== 'online') {
      return res.json({ 
        success: false, 
        message: 'Le paiement en ligne (Wave) est obligatoire pour les produits personnalisés' 
      });
    }
    
    const total = subtotal + zone.price;
    
    // Calculer la date de livraison
    const now = new Date();
    const expectedDeliveryDate = new Date(now);
    
    if (hasExpressEligible) {
      expectedDeliveryDate.setDate(now.getDate());
    } else {
      expectedDeliveryDate.setDate(now.getDate() + 1);
    }
    
    /**
     * CORRECTION CRITIQUE: LOGIQUE DE CRÉATION DE COMMANDE
     * 
     * - Paiement à la livraison: Créer la commande MAINTENANT
     * - Paiement en ligne (Wave): NE PAS créer, stocker en session
     */
    
    if (paymentMethod === 'online') {
      // PAIEMENT WAVE: Stocker en session, créer après validation
      req.session.pendingOrder = {
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address
        },
        items: orderItems,
        deliveryZone: zone._id,
        deliveryZoneName: zone.name,
        deliveryPrice: zone.price,
        subtotal,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        expressDelivery: hasExpressEligible,
        expectedDeliveryDate,
        hasPersonalizedProduct
      };
      
      console.log('💳 Paiement Wave: Commande stockée en session (sera créée après paiement)');
      
      // Vider le panier
      req.session.cart = [];
      
      // Rediriger vers Wave
      return res.json({ 
        success: true, 
        redirect: '/wave',
        amount: total
      });
      
    } else {
      // PAIEMENT À LA LIVRAISON: Créer la commande MAINTENANT
      const order = new Order({
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address
        },
        items: orderItems,
        deliveryZone: zone._id,
        deliveryZoneName: zone.name,
        deliveryPrice: zone.price,
        subtotal,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
        expressDelivery: hasExpressEligible,
        expectedDeliveryDate
      });
      
      await order.save();
      console.log('✅ Commande à la livraison créée:', order.orderNumber);
      
      // DÉCRÉMENTER LE STOCK MAINTENANT
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Vider le panier
      req.session.cart = [];
      
      // Envoyer les emails immédiatement
      console.log('📧 Envoi emails en arrière-plan...');
      
      Promise.all([
        sendOrderConfirmationEmail(order),
        sendOrderNotificationToAdmin(order)
      ]).then(() => {
        console.log('✅ Emails envoyés avec succès');
      }).catch((emailError) => {
        console.error('❌ Erreur envoi emails:', emailError);
      });
      
      // Rediriger vers confirmation
      return res.json({ 
        success: true, 
        redirect: `/confirmation/${order.orderNumber}`,
        orderNumber: order.orderNumber
      });
    }
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.json({ 
      success: false, 
      message: 'Erreur lors de la création de la commande: ' + error.message 
    });
  }
});

/**
 * Page de paiement Wave
 */
router.get('/wave', async (req, res) => {
  try {
    // Vérifier qu'il y a une commande en attente
    if (!req.session.pendingOrder) {
      return res.redirect('/panier');
    }
    
    const logoPage = await Page.findOne({ pageType: 'logo' });
    
    res.render('client/wave', {
      title: 'Paiement Wave - Denisia Bijoux',
      order: req.session.pendingOrder,
      logo: logoPage?.logo || null
    });
  } catch (error) {
    console.error('Erreur page Wave:', error);
    res.redirect('/');
  }
});

/**
 * Confirmer le paiement Wave - CRÉE la commande depuis session
 */
router.post('/paiement/wave/confirmer', async (req, res) => {
  try {
    // Vérifier qu'il y a une commande en attente
    if (!req.session.pendingOrder) {
      return res.json({ success: false, message: 'Aucune commande en attente' });
    }
    
    const pendingData = req.session.pendingOrder;
    
    console.log('💳 Paiement Wave validé: CRÉATION de la commande...');
    
    // CRÉER LA COMMANDE MAINTENANT
    const order = new Order({
      customer: pendingData.customer,
      items: pendingData.items,
      deliveryZone: pendingData.deliveryZone,
      deliveryZoneName: pendingData.deliveryZoneName,
      deliveryPrice: pendingData.deliveryPrice,
      subtotal: pendingData.subtotal,
      total: pendingData.total,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      expressDelivery: pendingData.expressDelivery,
      expectedDeliveryDate: pendingData.expectedDeliveryDate
    });
    
    await order.save();
    console.log('✅ Commande créée après paiement Wave:', order.orderNumber);
    
    // DÉCRÉMENTER LE STOCK MAINTENANT
    for (const item of pendingData.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Supprimer pendingOrder
    delete req.session.pendingOrder;
    
    // Envoyer les emails
    console.log('📧 Envoi des emails...');
    
    Promise.all([
      sendOrderConfirmationEmail(order),
      sendOrderNotificationToAdmin(order)
    ]).then(() => {
      console.log('✅ Emails envoyés avec succès');
    }).catch((emailError) => {
      console.error('❌ Erreur envoi emails:', emailError);
    });
    
    res.json({ 
      success: true, 
      redirect: `/confirmation/${order.orderNumber}` 
    });
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.json({ success: false, message: 'Erreur lors de la confirmation du paiement' });
  }
});

// Page de confirmation
router.get('/confirmation/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.redirect('/');
    }
    
    const logoPage = await Page.findOne({ pageType: 'logo' });
    
    res.render('client/confirmation', {
      title: 'Confirmation - Denisia Bijoux',
      order,
      logo: logoPage?.logo || null
    });
  } catch (error) {
    console.error('Erreur page confirmation:', error);
    res.redirect('/');
  }
});

// Page À propos
router.get('/a-propos', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const aboutPage = await Page.findOne({ pageType: 'about' });
    
    res.render('client/about', {
      title: 'À propos - Denisia Bijoux',
      page: aboutPage,
      logo: logoPage?.logo || null,
      cart: req.session.cart || []
    });
  } catch (error) {
    console.error('Erreur page à propos:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement de la page',
      logo: null,
      cart: []
    });
  }
});

// Page Contact
router.get('/contact', async (req, res) => {
  try {
    const logoPage = await Page.findOne({ pageType: 'logo' });
    const contactPage = await Page.findOne({ pageType: 'contact' });
    
    res.render('client/contact', {
      title: 'Contact - Denisia Bijoux',
      page: contactPage,
      logo: logoPage?.logo || null,
      cart: req.session.cart || []
    });
  } catch (error) {
    console.error('Erreur page contact:', error);
    res.status(500).render('client/error', { 
      error: 'Erreur lors du chargement de la page',
      logo: null,
      cart: []
    });
  }
});

module.exports = router;
