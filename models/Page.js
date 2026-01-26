const mongoose = require('mongoose');

/**
 * MODÈLE PAGE
 * Gère les pages modifiables du site (À propos, Contact, Logo)
 */
const pageSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'contact', 'logo']
  },
  content: {
    type: String
  },
  images: [{
    type: String
  }],
  logo: {
    type: String
  },
  contactInfo: {
    email: String,
    phone: String,
    instagram: String,
    tiktok: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Page', pageSchema);
