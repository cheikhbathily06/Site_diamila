const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * CORRECTION 1: Configuration Multer pour l'upload d'images
 * 
 * Problème corrigé: L'admin ne pouvait pas uploader les photos des produits
 * 
 * Solution:
 * - Création automatique des dossiers s'ils n'existent pas
 * - Noms de fichiers uniques avec timestamp
 * - Validation stricte des types de fichiers
 * - Limites de taille appropriées
 */

// Créer les dossiers uploads s'ils n'existent pas
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`✅ Dossier créé: ${directory}`);
  }
};

// Créer les dossiers au démarrage
ensureDirectoryExists('uploads');
ensureDirectoryExists('uploads/products');
ensureDirectoryExists('uploads/pages');

// Configuration pour les produits
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/products';
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Nom unique: timestamp + random + extension originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Configuration pour les pages
const pageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/pages';
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'page-' + uniqueSuffix + ext);
  }
});

// Filtre pour les images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
};

// Filtre pour les vidéos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les vidéos sont autorisées (mp4, avi, mov, wmv, flv, webm)'));
  }
};

// Configuration upload pour images de produits
const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max par image
    files: 10 // Maximum 10 fichiers
  }
});

// Configuration upload pour vidéos de produits
const uploadProductVideos = multer({
  storage: productStorage,
  fileFilter: videoFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max par vidéo
    files: 3 // Maximum 3 vidéos
  }
});

// Configuration upload pour images de pages
const uploadPageImages = multer({
  storage: pageStorage,
  fileFilter: imageFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 10
  }
});

module.exports = {
  uploadProductImages,
  uploadProductVideos,
  uploadPageImages
};
