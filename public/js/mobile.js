/* ===============================================
   DENISIA BIJOUX - JavaScript Mobile
   =============================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // ==========================================
  // MENU HAMBURGER CLIENT
  // ==========================================
  
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  
  // Créer l'overlay
  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }
  
  if (mobileToggle && nav) {
    // Toggle menu
    mobileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      mobileToggle.classList.toggle('active');
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Fermer au clic sur overlay
    overlay.addEventListener('click', function() {
      mobileToggle.classList.remove('active');
      nav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Fermer au clic sur un lien
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  
  // ==========================================
  // ADMIN MOBILE SIDEBAR
  // ==========================================
  
  const adminSidebar = document.querySelector('.admin-sidebar');
  const adminContent = document.querySelector('.admin-content');
  
  if (adminSidebar && adminContent && window.innerWidth <= 991) {
    // Créer le bouton toggle
    let toggleBtn = document.querySelector('.admin-mobile-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'admin-mobile-toggle';
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      document.body.appendChild(toggleBtn);
    }
    
    // Créer l'overlay admin
    let adminOverlay = document.querySelector('.admin-mobile-overlay');
    if (!adminOverlay) {
      adminOverlay = document.createElement('div');
      adminOverlay.className = 'mobile-overlay admin-mobile-overlay';
      document.body.appendChild(adminOverlay);
    }
    
    // Toggle sidebar
    toggleBtn.addEventListener('click', function() {
      adminSidebar.classList.toggle('active');
      adminOverlay.classList.toggle('active');
      toggleBtn.innerHTML = adminSidebar.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });
    
    // Fermer au clic sur overlay
    adminOverlay.addEventListener('click', function() {
      adminSidebar.classList.remove('active');
      adminOverlay.classList.remove('active');
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
    
    // Fermer au clic sur un lien sidebar
    const sidebarLinks = adminSidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 991) {
          adminSidebar.classList.remove('active');
          adminOverlay.classList.remove('active');
          toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
      });
    });
  }
  
  // ==========================================
  // RESPONSIVE WINDOW RESIZE
  // ==========================================
  
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && nav) {
      nav.classList.remove('active');
      if (mobileToggle) mobileToggle.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    if (window.innerWidth > 991 && adminSidebar) {
      adminSidebar.classList.remove('active');
      const adminOverlay = document.querySelector('.admin-mobile-overlay');
      if (adminOverlay) adminOverlay.classList.remove('active');
    }
  });
  
});
