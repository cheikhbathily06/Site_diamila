const mongoose = require('mongoose');

/**
 * MODÈLE PRODUCT
 * Gère tous les produits du catalogue
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  category: {
    type: String,
    required: true,
    enum: ['bijou', 'bracelet_simple', 'bracelet_personnalise', 'box_cadeau']
  },
  isPersonalized: {
    type: Boolean,
    default: false
  },
  maxCharacters: {
    type: Number,
    default: 0
  },
  hasCountdown: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Vérifier automatiquement le stock
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

module.exports = mongoose.model('Product', productSchema);
