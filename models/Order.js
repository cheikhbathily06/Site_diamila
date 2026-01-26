const mongoose = require('mongoose');

/**
 * MODÈLE ORDER - CORRIGÉ
 * 
 * CORRECTION 6: Ajout du champ pour distinguer paiement en ligne / à la livraison
 * 
 * Modifications:
 * - Ajout de paymentStatus pour suivre l'état du paiement
 * - Distinction claire entre paiement online (Wave) et delivery (cash)
 * - Amélioration des statuts de commande
 */
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // Sera généré automatiquement par le pre-save hook
  },
  customer: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    productPrice: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    isPersonalized: Boolean,
    personalizationText: String,
    subtotal: Number
  }],
  deliveryZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryZone',
    required: true
  },
  deliveryZoneName: String,
  deliveryPrice: {
    type: Number,
    required: true,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  // CORRECTION 6: Méthode de paiement (online = Wave, delivery = Cash)
  paymentMethod: {
    type: String,
    required: true,
    enum: ['online', 'delivery']
  },
  // CORRECTION 6: Statut du paiement
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'failed']
  },
  // Statut de la commande
  orderStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  // Livraison express
  expressDelivery: {
    type: Boolean,
    default: false
  },
  expectedDeliveryDate: {
    type: Date
  },
  // CORRECTION 4: Informations Wave (si paiement online)
  waveTransactionId: {
    type: String,
    default: null
  },
  wavePaymentUrl: {
    type: String,
    default: null
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

// Générer un numéro de commande unique
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `CMD-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
