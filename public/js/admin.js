// Fonctions utilitaires admin
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Sidebar mobile
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
  
  // Fermer le sidebar quand on clique en dehors sur mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });
});

// Prévisualisation des images
function previewImages(input, previewContainer) {
  if (!input.files) return;
  
  const container = document.getElementById(previewContainer);
  if (!container) return;
  
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" class="preview-image" alt="Preview">
        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
      `;
      container.appendChild(div);
    };
    
    reader.readAsDataURL(file);
  });
  
  // Réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers
  input.value = '';
}

// Supprimer une image de produit
async function deleteProductImage(productId, imageUrl) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
  
  try {
    const response = await fetch(`/admin/products/${productId}/delete-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Image supprimée', 'success');
      location.reload();
    } else {
      showToast('Erreur lors de la suppression', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// Supprimer une image de page
async function deletePageImage(pageType, imageUrl) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
  
  try {
    const response = await fetch(`/admin/pages/${pageType}/delete-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Image supprimée', 'success');
      location.reload();
    } else {
      showToast('Erreur lors de la suppression', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de la suppression', 'error');
  }
}

// Confirmer la suppression
function confirmDelete(message = 'Êtes-vous sûr de vouloir supprimer cet élément ?') {
  return confirm(message);
}

// Mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, statusType, statusValue) {
  try {
    const body = {};
    body[statusType] = statusValue;
    
    const response = await fetch(`/admin/orders/${orderId}/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Statut mis à jour', 'success');
      location.reload();
    } else {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showToast('Erreur lors de la mise à jour', 'error');
  }
}

// Toggle personnalisation dans le formulaire produit
function togglePersonalization() {
  const isPersonalizedCheckbox = document.getElementById('isPersonalized');
  const maxCharactersGroup = document.getElementById('maxCharacters-group');
  const countdownGroup = document.getElementById('countdown-group');
  
  if (isPersonalizedCheckbox && maxCharactersGroup) {
    if (isPersonalizedCheckbox.checked) {
      maxCharactersGroup.style.display = 'block';
      if (countdownGroup) countdownGroup.style.display = 'block';
    } else {
      maxCharactersGroup.style.display = 'none';
      if (countdownGroup) countdownGroup.style.display = 'none';
    }
  }
}

// Graphiques simples avec Chart.js (si disponible)
function initCharts() {
  // Graphique des ventes par catégorie
  const categorySalesCanvas = document.getElementById('category-sales-chart');
  if (categorySalesCanvas && typeof Chart !== 'undefined') {
    const ctx = categorySalesCanvas.getContext('2d');
    const data = JSON.parse(categorySalesCanvas.dataset.sales || '{}');
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [
          'Bracelets Personnalisés',
          'Bracelets Simples',
          'Bijoux',
          'Boxes Cadeaux'
        ],
        datasets: [{
          data: [
            data.bracelet_personnalise || 0,
            data.bracelet_simple || 0,
            data.bijou || 0,
            data.box_cadeau || 0
          ],
          backgroundColor: [
            '#d4a853',
            '#b89044',
            '#a67c3c',
            '#8f6a31'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Répartition des ventes par catégorie'
          }
        }
      }
    });
  }
  
  // Graphique des produits les plus vendus
  const topProductsCanvas = document.getElementById('top-products-chart');
  if (topProductsCanvas && typeof Chart !== 'undefined') {
    const ctx = topProductsCanvas.getContext('2d');
    const products = JSON.parse(topProductsCanvas.dataset.products || '[]');
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: products.map(p => p.name),
        datasets: [{
          label: 'Quantité vendue',
          data: products.map(p => p.quantity),
          backgroundColor: '#d4a853'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top 5 des produits les plus vendus'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

// Recherche dans les tables
function searchTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  
  if (!input || !table) return;
  
  input.addEventListener('keyup', function() {
    const filter = this.value.toLowerCase();
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? '' : 'none';
    });
  });
}

// Tri des tables
function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  let ascending = true;
  const currentSort = table.dataset.sortColumn;
  const currentDirection = table.dataset.sortDirection;
  
  if (currentSort == columnIndex && currentDirection === 'asc') {
    ascending = false;
  }
  
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();
    
    // Essayer de comparer comme des nombres
    const aNum = parseFloat(aValue.replace(/[^0-9.-]/g, ''));
    const bNum = parseFloat(bValue.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return ascending ? aNum - bNum : bNum - aNum;
    }
    
    // Comparer comme des chaînes
    return ascending ? 
      aValue.localeCompare(bValue) : 
      bValue.localeCompare(aValue);
  });
  
  // Réorganiser les lignes
  rows.forEach(row => tbody.appendChild(row));
  
  // Sauvegarder l'état du tri
  table.dataset.sortColumn = columnIndex;
  table.dataset.sortDirection = ascending ? 'asc' : 'desc';
}

// Modal générique
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Confirmation avant soumission de formulaire
function confirmSubmit(form, message) {
  form.addEventListener('submit', function(e) {
    if (!confirm(message)) {
      e.preventDefault();
    }
  });
}

// Export de données en CSV
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cols = row.querySelectorAll('td, th');
    const rowData = Array.from(cols).map(col => {
      let data = col.textContent.trim();
      // Échapper les guillemets
      data = data.replace(/"/g, '""');
      // Entourer de guillemets si contient une virgule
      if (data.includes(',')) {
        data = `"${data}"`;
      }
      return data;
    });
    csv.push(rowData.join(','));
  });
  
  // Créer le fichier et télécharger
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename + '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les graphiques
  initCharts();
  
  // Toggle personnalisation
  const isPersonalizedCheckbox = document.getElementById('isPersonalized');
  if (isPersonalizedCheckbox) {
    isPersonalizedCheckbox.addEventListener('change', togglePersonalization);
    togglePersonalization();
  }
  
  // Recherche dans les tables
  searchTable('search-products', 'products-table');
  searchTable('search-orders', 'orders-table');
  
  // Confirmation de suppression pour tous les formulaires de suppression
  document.querySelectorAll('form[action*="delete"]').forEach(form => {
    confirmSubmit(form, 'Êtes-vous sûr de vouloir supprimer cet élément ?');
  });
  
  // Fermer les modals en cliquant en dehors
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
});

// Animation de chargement
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Validation de formulaire
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#f44336';
      isValid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  
  if (!isValid) {
    showToast('Veuillez remplir tous les champs obligatoires', 'error');
  }
  
  return isValid;
}

// Auto-sauvegarde des brouillons (optionnel)
function enableAutoSave(formId, storageKey) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  // Charger les données sauvegardées
  const savedData = localStorage.getItem(storageKey);
  if (savedData) {
    const data = JSON.parse(savedData);
    Object.keys(data).forEach(key => {
      const field = form.elements[key];
      if (field) field.value = data[key];
    });
  }
  
  // Sauvegarder automatiquement
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      localStorage.setItem(storageKey, JSON.stringify(data));
    });
  });
  
  // Nettoyer après soumission
  form.addEventListener('submit', () => {
    localStorage.removeItem(storageKey);
  });
}

/* ===============================================
   ADMIN MOBILE TOGGLE
   =============================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // Créer le bouton toggle admin mobile
  if (window.innerWidth <= 991) {
    const sidebar = document.querySelector('.admin-sidebar');
    const adminContent = document.querySelector('.admin-content');
    
    if (sidebar && adminContent) {
      // Créer le bouton
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'admin-mobile-toggle';
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      document.body.appendChild(toggleBtn);
      
      // Créer l'overlay
      const overlay = document.createElement('div');
      overlay.className = 'mobile-overlay';
      document.body.appendChild(overlay);
      
      // Toggle au clic
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        toggleBtn.innerHTML = sidebar.classList.contains('active') 
          ? '<i class="fas fa-times"></i>' 
          : '<i class="fas fa-bars"></i>';
      });
      
      // Fermer au clic sur overlay
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
      
      // Fermer au clic sur un lien
      const sidebarLinks = sidebar.querySelectorAll('a');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
      });
    }
  }
  
});
