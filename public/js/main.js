// Fonctions utilitaires
function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '10000';
  toast.style.minWidth = '300px';
  toast.style.animation = 'fadeIn 0.3s';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Menu mobile
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
});

/**
 * CORRECTION 3: Compte à rebours pour bracelets personnalisés
 * 
 * Affiche un compte à rebours jusqu'à 17h pour les bracelets personnalisés
 * Si commande passée avant 17h = livraison le jour même
 */
function initCountdown(deadline) {
  const countdownElement = document.getElementById('countdown-timer');
  if (!countdownElement || !deadline) return;
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = new Date(deadline).getTime() - now;
    
    if (distance < 0) {
      countdownElement.innerHTML = '<p style="color: #f44336;">⏰ Délai expiré - Livraison demain</p>';
      return;
    }
    
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdownElement.innerHTML = `
      <div class="timer" style="display: flex; justify-content: center; align-items: center; gap: 10px;">
        <div style="background: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5rem; font-weight: bold; color: #f44336;">${String(hours).padStart(2, '0')}</div>
          <div style="font-size: 0.8rem; color: #666;">HEURES</div>
        </div>
        <div style="font-size: 2rem; color: #f44336;">:</div>
        <div style="background: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5rem; font-weight: bold; color: #f44336;">${String(minutes).padStart(2, '0')}</div>
          <div style="font-size: 0.8rem; color: #666;">MINUTES</div>
        </div>
        <div style="font-size: 2rem; color: #f44336;">:</div>
        <div style="background: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5rem; font-weight: bold; color: #f44336;">${String(seconds).padStart(2, '0')}</div>
          <div style="font-size: 0.8rem; color: #666;">SECONDES</div>
        </div>
      </div>
      <p style="margin-top: 15px; color: #4caf50; font-weight: 600;">
        ⚡ Commandez maintenant pour une livraison aujourd'hui !
      </p>
    `;
  }
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  
  // Nettoyer l'intervalle après expiration
  setTimeout(() => {
    clearInterval(interval);
  }, new Date(deadline).getTime() - new Date().getTime() + 1000);
}

// Galerie d'images produit
function initProductGallery() {
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  if (!mainImage || thumbnails.length === 0) return;
  
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', function() {
      mainImage.src = this.src;
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// Ajouter au panier
async function addToCart(productId) {
  const quantity = document.getElementById('product-quantity')?.value || 1;
  const personalizationInput = document.getElementById('personalization-text');
  const personalizationText = personalizationInput ? personalizationInput.value : null;
  
  try {
    const response = await fetch('/panier/ajouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId,
        quantity: parseInt(quantity),
        personalizationText
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Produit ajouté au panier !', 'success');
      // Mettre à jour le compteur du panier
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        cartCount.textContent = data.cartCount;
      }
    } else {
      showToast(data.message || 'Erreur lors de l\'ajout au panier', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de l\'ajout au panier', 'error');
  }
}

// Mettre à jour la quantité dans le panier
async function updateCartQuantity(index, quantity) {
  try {
    const response = await fetch('/panier/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ index, quantity: parseInt(quantity) })
    });
    
    const data = await response.json();
    
    if (data.success) {
      location.reload();
    } else {
      showToast(data.message || 'Erreur lors de la mise à jour', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de la mise à jour', 'error');
  }
}

// Supprimer du panier
async function removeFromCart(index) {
  if (!confirm('Êtes-vous sûr de vouloir retirer ce produit ?')) return;
  
  try {
    const response = await fetch('/panier/supprimer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ index })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Produit retiré du panier', 'success');
      location.reload();
    } else {
      showToast(data.message || 'Erreur lors de la suppression', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// Calculer le total du panier
function calculateCartTotal() {
  const items = document.querySelectorAll('.cart-item');
  let subtotal = 0;
  
  items.forEach(item => {
    const price = parseFloat(item.dataset.price);
    const quantity = parseInt(item.querySelector('.quantity-input')?.value || 1);
    subtotal += price * quantity;
  });
  
  const deliverySelect = document.getElementById('delivery-zone');
  const deliveryPrice = deliverySelect ? parseFloat(deliverySelect.options[deliverySelect.selectedIndex]?.dataset.price || 0) : 0;
  
  const total = subtotal + deliveryPrice;
  
  // Mettre à jour l'affichage
  const subtotalElement = document.getElementById('cart-subtotal');
  const deliveryElement = document.getElementById('cart-delivery');
  const totalElement = document.getElementById('cart-total');
  
  if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
  if (deliveryElement) deliveryElement.textContent = formatPrice(deliveryPrice);
  if (totalElement) totalElement.textContent = formatPrice(total);
}

// Soumettre la commande
// Variable globale pour empêcher double soumission
let isSubmitting = false;

async function submitOrder(event) {
  event.preventDefault();
  
  // PROTECTION: Empêcher double soumission
  if (isSubmitting) {
    console.log('⚠️ Soumission déjà en cours, ignorée');
    return;
  }
  
  isSubmitting = true;
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Vérifier que tous les champs sont remplis
  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.address || !data.deliveryZone || !data.paymentMethod) {
    showToast('Veuillez remplir tous les champs', 'error');
    isSubmitting = false;
    return;
  }
  
  // MODIFICATION FINALE 2: Animation magnifique pendant le traitement
  const submitButton = form.querySelector('button[type="submit"]');
  const btnIcon = submitButton.querySelector('.btn-icon-wrapper i');
  const btnMainText = submitButton.querySelector('.btn-main-text');
  const btnSubText = submitButton.querySelector('.btn-sub-text');
  
  // État de chargement
  submitButton.disabled = true;
  submitButton.classList.add('loading');
  
  if (btnIcon) {
    btnIcon.className = 'fas fa-spinner'; // Icône spinner
  }
  if (btnMainText) {
    btnMainText.textContent = 'Confirmation en cours';
  }
  if (btnSubText) {
    btnSubText.textContent = 'Veuillez patienter...';
  }
  
  try {
    const response = await fetch('/commander', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // État de succès avec animation
      submitButton.classList.remove('loading');
      submitButton.classList.add('success');
      
      if (btnIcon) {
        btnIcon.className = 'fas fa-check-circle';
      }
      if (btnMainText) {
        btnMainText.textContent = 'Commande confirmée !';
      }
      if (btnSubText) {
        btnSubText.textContent = 'Redirection...';
      }
      
      showToast('✅ Commande créée avec succès !', 'success');
      
      // Redirection IMMÉDIATE (pas de setTimeout)
      window.location.href = result.redirect;
    } else {
      // Restaurer le bouton en cas d'erreur
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      isSubmitting = false; // Réactiver pour nouvelle tentative
      
      if (btnIcon) {
        btnIcon.className = 'fas fa-check-circle';
      }
      if (btnMainText) {
        btnMainText.textContent = 'Confirmer ma commande';
      }
      if (btnSubText) {
        btnSubText.textContent = 'Paiement sécurisé 🔒';
      }
      
      showToast(result.message || 'Erreur lors de la création de la commande', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    
    // Restaurer le bouton
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    
    if (btnIcon) {
      btnIcon.className = 'fas fa-check-circle';
    }
    if (btnMainText) {
      btnMainText.textContent = 'Confirmer ma commande';
    }
    if (btnSubText) {
      btnSubText.textContent = 'Paiement sécurisé 🔒';
    }
    
    showToast('Erreur lors de la création de la commande', 'error');
  }
}

// MODIFICATION 4: Fonction PayTech supprimée - Seul Wave est utilisé
// La confirmation de paiement Wave est gérée dans wave.ejs

// Filtrer les produits par catégorie
function filterProducts(category) {
  window.location.href = `/boutique?category=${category}`;
}

// Vérifier le mode de paiement
function checkPaymentMethod() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const hasPersonalizedProduct = document.getElementById('has-personalized')?.value === 'true';
  
  if (hasPersonalizedProduct) {
    paymentMethods.forEach(method => {
      if (method.value === 'delivery') {
        method.disabled = true;
        method.closest('.payment-option').style.opacity = '0.5';
      }
    });
    
    // Sélectionner automatiquement le paiement en ligne
    const onlinePayment = document.querySelector('input[value="online"]');
    if (onlinePayment) {
      onlinePayment.checked = true;
    }
  }
}

// Animation au scroll
function animateOnScroll() {
  const elements = document.querySelectorAll('.product-card, .section-title');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(el => observer.observe(el));
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser la galerie produit
  initProductGallery();
  
  // Initialiser le compte à rebours si présent
  const countdownDeadline = document.getElementById('countdown-deadline')?.value;
  if (countdownDeadline) {
    initCountdown(countdownDeadline);
  }
  
  // Vérifier le mode de paiement
  checkPaymentMethod();
  
  // Calculer le total du panier
  const deliverySelect = document.getElementById('delivery-zone');
  if (deliverySelect) {
    deliverySelect.addEventListener('change', calculateCartTotal);
    calculateCartTotal();
  }
  
  // Animations
  animateOnScroll();
  
  // Formulaire de commande
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', submitOrder);
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* ===============================================
   SITEAMALA04 - JavaScript pour mobile
   =============================================== */

// Menu mobile toggle
document.addEventListener('DOMContentLoaded', function() {
  
  // Menu hamburger
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  document.body.appendChild(overlay);
  
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', function() {
      mobileToggle.classList.toggle('active');
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', function() {
      mobileToggle.classList.remove('active');
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });
    
    // Fermer le menu au clic sur un lien
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
      });
    });
  }
  
});
