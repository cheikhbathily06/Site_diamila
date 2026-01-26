const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryZone = require('../models/DeliveryZone');
const Page = require('../models/Page');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const { uploadProductImages, uploadProductVideos, uploadPageImages } = require('../config/multer');
const fs = require('fs');
const path = require('path');

/**
 * ROUTES ADMIN - VERSION CORRIGÉE
 * 
 * CORRECTIONS APPLIQUÉES:
 * - CORRECTION 1: Upload d'images fonctionnel
 * - CORRECTION 6: Affichage du statut de paiement (Wave/Cash)
 */

// Page de connexion
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('admin/login', {
    title: 'Connexion Admin',
    error: null
  });
});

// Traiter la connexion
router.post('/login', isNotAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.render('admin/login', {
        title: 'Connexion Admin',
        error: 'Identifiants invalides'
      });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.render('admin/login', {
        title: 'Connexion Admin',
        error: 'Identifiants invalides'
      });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    req.session.adminId = admin._id;
    req.session.adminEmail = admin.email;
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    res.render('admin/login', {
      title: 'Connexion Admin',
      error: 'Erreur lors de la connexion'
    });
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard avec statistiques
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      orderStatus: { $ne: 'cancelled' }
    });
    
    const totalSales = monthOrders.reduce((sum, order) => sum + order.total, 0);
    const ordersCount = monthOrders.length;
    
    const productSales = {};
    monthOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = 0;
        }
        productSales[item.productName] += item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
    
    const categorySales = {
      'bracelet_personnalise': 0,
      'bracelet_simple': 0,
      'bijou': 0,
      'box_cadeau': 0
    };
    
    for (const order of monthOrders) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          categorySales[product.category] += item.subtotal;
        }
      }
    }
    
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrdersAll = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    
    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      adminEmail: req.session.adminEmail,
      stats: {
        totalSales,
        ordersCount,
        topProducts,
        categorySales,
        totalProducts,
        totalOrdersAll,
        pendingOrders
      },
      monthName: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).render('admin/error', { error: 'Erreur lors du chargement du dashboard' });
  }
});

// Liste des produits
router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.render('admin/products', {
      title: 'Gestion des Produits',
      adminEmail: req.session.adminEmail,
      products
    });
  } catch (error) {
    console.error('Erreur liste produits:', error);
    res.status(500).render('admin/error', { error: 'Erreur lors du chargement des produits' });
  }
});

// Formulaire d'ajout de produit
router.get('/products/new', isAuthenticated, (req, res) => {
  res.render('admin/product-form', {
    title: 'Ajouter un Produit',
    adminEmail: req.session.adminEmail,
    product: null,
    error: null
  });
});

/**
 * CORRECTION 1: Créer un nouveau produit avec upload d'images
 * 
 * Problème corrigé: L'admin ne pouvait pas uploader de photos
 * 
 * Solution:
 * - Utilisation correcte de multer avec uploadProductImages.array('images', 5)
 * - Vérification que les fichiers sont bien uploadés
 * - Stockage des chemins relatifs dans la base de données
 */
router.post('/products/create', isAuthenticated, uploadProductImages.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, isPersonalized, maxCharacters, hasCountdown, stock } = req.body;
    
    // Construire le tableau d'images
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    
    console.log('✅ Création produit - Images uploadées:', images);
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      isPersonalized: isPersonalized === 'true',
      maxCharacters: isPersonalized === 'true' ? parseInt(maxCharacters) || 0 : 0,
      hasCountdown: hasCountdown === 'true',
      stock: parseInt(stock),
      images: images
    });
    
    await product.save();
    console.log('✅ Produit créé avec succès:', product.name);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.render('admin/product-form', {
      title: 'Ajouter un Produit',
      adminEmail: req.session.adminEmail,
      product: null,
      error: 'Erreur lors de la création du produit: ' + error.message
    });
  }
});

// Formulaire de modification de produit
router.get('/products/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/admin/products');
    }
    
    res.render('admin/product-form', {
      title: 'Modifier le Produit',
      adminEmail: req.session.adminEmail,
      product,
      error: null
    });
  } catch (error) {
    console.error('Erreur chargement produit:', error);
    res.redirect('/admin/products');
  }
});

/**
 * CORRECTION 1: Mettre à jour un produit avec nouvelles images
 */
router.post('/products/update/:id', isAuthenticated, uploadProductImages.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, isPersonalized, maxCharacters, hasCountdown, stock, isActive } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.redirect('/admin/products');
    }
    
    product.name = name;
    product.description = description;
    product.price = parseFloat(price);
    product.category = category;
    product.isPersonalized = isPersonalized === 'true';
    product.maxCharacters = isPersonalized === 'true' ? parseInt(maxCharacters) || 0 : 0;
    product.hasCountdown = hasCountdown === 'true';
    product.stock = parseInt(stock);
    product.isActive = isActive === 'true';
    
    // Ajouter les nouvelles images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      product.images = [...product.images, ...newImages];
      console.log('✅ Nouvelles images ajoutées:', newImages);
    }
    
    await product.save();
    console.log('✅ Produit mis à jour:', product.name);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.redirect('/admin/products');
  }
});

// Supprimer une image de produit
router.post('/products/:id/delete-image', isAuthenticated, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.json({ success: false });
    }
    
    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();
    
    const filePath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression image:', error);
    res.json({ success: false });
  }
});

// Supprimer un produit
router.post('/products/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.images.forEach(imageUrl => {
        const filePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      product.videos.forEach(videoUrl => {
        const filePath = path.join(__dirname, '..', videoUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      await Product.findByIdAndDelete(req.params.id);
    }
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.redirect('/admin/products');
  }
});

/**
 * CORRECTION 6: Liste des commandes avec statut de paiement visible
 */
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    // Récupérer toutes les commandes
    const allOrders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    // Séparer les commandes en cours et livrées
    const pendingOrders = allOrders.filter(order => order.orderStatus !== 'delivered');
    const deliveredOrders = allOrders.filter(order => order.orderStatus === 'delivered');
    
    res.render('admin/orders', {
      title: 'Gestion des Commandes',
      adminEmail: req.session.adminEmail,
      // CORRECTION: Ne passer QUE pendingOrders et deliveredOrders
      pendingOrders,
      deliveredOrders
    });
  } catch (error) {
    console.error('Erreur liste commandes:', error);
    res.status(500).render('admin/error', { error: 'Erreur lors du chargement des commandes' });
  }
});

/**
 * CORRECTION 6: Détail d'une commande avec info paiement
 */
router.get('/orders/:id', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('deliveryZone');
    
    if (!order) {
      return res.redirect('/admin/orders');
    }
    
    res.render('admin/order-detail', {
      title: `Commande ${order.orderNumber}`,
      adminEmail: req.session.adminEmail,
      order
    });
  } catch (error) {
    console.error('Erreur détail commande:', error);
    res.redirect('/admin/orders');
  }
});

// Mettre à jour le statut d'une commande
router.post('/orders/:id/update-status', isAuthenticated, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.json({ success: false });
    }
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    res.json({ success: false });
  }
});

// Gestion des zones de livraison
router.get('/delivery-zones', isAuthenticated, async (req, res) => {
  try {
    const zones = await DeliveryZone.find().sort({ name: 1 });
    
    res.render('admin/delivery-zones', {
      title: 'Zones de Livraison',
      adminEmail: req.session.adminEmail,
      zones
    });
  } catch (error) {
    console.error('Erreur zones de livraison:', error);
    res.status(500).render('admin/error', { error: 'Erreur lors du chargement des zones' });
  }
});

// Créer une zone de livraison
router.post('/delivery-zones/create', isAuthenticated, async (req, res) => {
  try {
    const { name, price } = req.body;
    
    const zone = new DeliveryZone({
      name,
      price: parseFloat(price)
    });
    
    await zone.save();
    res.redirect('/admin/delivery-zones');
  } catch (error) {
    console.error('Erreur création zone:', error);
    res.redirect('/admin/delivery-zones');
  }
});

// Supprimer une zone de livraison
router.post('/delivery-zones/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await DeliveryZone.findByIdAndDelete(req.params.id);
    res.redirect('/admin/delivery-zones');
  } catch (error) {
    console.error('Erreur suppression zone:', error);
    res.redirect('/admin/delivery-zones');
  }
});

// Gestion des pages
router.get('/pages', isAuthenticated, async (req, res) => {
  try {
    const aboutPage = await Page.findOne({ pageType: 'about' });
    const contactPage = await Page.findOne({ pageType: 'contact' });
    const logoPage = await Page.findOne({ pageType: 'logo' });
    
    res.render('admin/pages', {
      title: 'Gestion des Pages',
      adminEmail: req.session.adminEmail,
      aboutPage,
      contactPage,
      logoPage
    });
  } catch (error) {
    console.error('Erreur pages:', error);
    res.status(500).render('admin/error', { error: 'Erreur lors du chargement des pages' });
  }
});

// Mettre à jour la page À propos
router.post('/pages/about', isAuthenticated, uploadPageImages.array('images', 5), async (req, res) => {
  try {
    const { content } = req.body;
    
    let page = await Page.findOne({ pageType: 'about' });
    
    if (!page) {
      page = new Page({ pageType: 'about' });
    }
    
    page.content = content;
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/pages/${file.filename}`);
      page.images = page.images ? [...page.images, ...newImages] : newImages;
    }
    
    await page.save();
    res.redirect('/admin/pages');
  } catch (error) {
    console.error('Erreur mise à jour page À propos:', error);
    res.redirect('/admin/pages');
  }
});

// Mettre à jour la page Contact
router.post('/pages/contact', isAuthenticated, uploadPageImages.array('images', 5), async (req, res) => {
  try {
    const { content, email, phone, instagram, tiktok } = req.body;
    
    let page = await Page.findOne({ pageType: 'contact' });
    
    if (!page) {
      page = new Page({ pageType: 'contact' });
    }
    
    page.content = content;
    page.contactInfo = {
      email: email || '',
      phone: phone || '',
      instagram: instagram || '',
      tiktok: tiktok || ''
    };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/pages/${file.filename}`);
      page.images = page.images ? [...page.images, ...newImages] : newImages;
    }
    
    await page.save();
    res.redirect('/admin/pages');
  } catch (error) {
    console.error('Erreur mise à jour page Contact:', error);
    res.redirect('/admin/pages');
  }
});

/**
 * CORRECTION 1: Mettre à jour le logo avec upload fonctionnel
 */
router.post('/pages/logo', isAuthenticated, uploadPageImages.single('logo'), async (req, res) => {
  try {
    let page = await Page.findOne({ pageType: 'logo' });
    
    if (!page) {
      page = new Page({ pageType: 'logo' });
    }
    
    if (req.file) {
      if (page.logo) {
        const oldLogoPath = path.join(__dirname, '..', page.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      page.logo = `/uploads/pages/${req.file.filename}`;
      await page.save();
      console.log('✅ Logo mis à jour:', page.logo);
    }
    
    res.redirect('/admin/pages');
  } catch (error) {
    console.error('❌ Erreur mise à jour logo:', error);
    res.redirect('/admin/pages');
  }
});

// Supprimer une image de page
router.post('/pages/:pageType/delete-image', isAuthenticated, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const page = await Page.findOne({ pageType: req.params.pageType });
    
    if (!page) {
      return res.json({ success: false });
    }
    
    page.images = page.images.filter(img => img !== imageUrl);
    await page.save();
    
    const filePath = path.join(__dirname, '..', imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression image page:', error);
    res.json({ success: false });
  }
});

module.exports = router;
