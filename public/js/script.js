// script.js (updated)
document.addEventListener("DOMContentLoaded", () => {
  // Navbar and footer are loaded via EJS includes, no need to fetch them
  // If navbar-placeholder or footer elements exist, they're already populated by the server

  // Scroll to top button
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollToTopBtn) {
      window.addEventListener('scroll', () => {
          scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
      });

      scrollToTopBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
});

// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('appSidebar');
  const menuToggle = document.getElementById('appMenuToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  // Function to open sidebar
  function openSidebar() {
    if (sidebar) {
      sidebar.classList.add('active');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add('active');
      }
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    }
  }

  // Function to close sidebar
  function closeSidebar() {
    if (sidebar) {
      sidebar.classList.remove('active');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.remove('active');
      }
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  // Toggle sidebar on three dots click
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  // Close sidebar on close button click
  if (sidebarClose) {
    sidebarClose.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Close sidebar when clicking on backdrop
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', function() {
      closeSidebar();
    });
  }

  // Close sidebar when clicking outside (for desktop)
  document.addEventListener('click', function(event) {
    if (sidebar && sidebar.classList.contains('active')) {
      if (!sidebar.contains(event.target) && 
          !menuToggle.contains(event.target) && 
          !sidebarBackdrop.contains(event.target)) {
        closeSidebar();
      }
    }
  });

  // Close sidebar on escape key press
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
});

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // ✅ Clear token from cookies and localStorage
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem("token");
            localStorage.removeItem("customer");

            window.location.href = "/app/login"; // Redirect to login
        });
    }
});

// Close navbar collapse menu when clicking any link (for mobile responsiveness)
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Bootstrap to be available
  function initNavbarClose() {
    const navbarCollapse = document.getElementById('navbarNav');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (!navbarCollapse) return;

    // Function to close navbar
    function closeNavbar() {
      if (navbarCollapse.classList.contains('show')) {
        // Use Bootstrap's collapse API if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
            return;
          }
        }
        // Fallback: manually remove show class and update attributes
        navbarCollapse.classList.remove('show');
        if (navbarToggler) {
          navbarToggler.setAttribute('aria-expanded', 'false');
          navbarToggler.classList.add('collapsed');
        }
      }
    }

    // Close navbar when clicking on any nav link (except dropdown toggles)
    const navLinks = navbarCollapse.querySelectorAll('.nav-link:not([data-bs-toggle="dropdown"])');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Only close if it's not a dropdown toggle
        if (!this.hasAttribute('data-bs-toggle') || this.getAttribute('data-bs-toggle') !== 'dropdown') {
          closeNavbar();
        }
      });
    });

    // Close navbar when clicking on dropdown items
    const dropdownItems = navbarCollapse.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function() {
        closeNavbar();
      });
    });

    // Close navbar when clicking on action buttons (Login, Logout, Get Started)
    const navButtons = navbarCollapse.querySelectorAll('.nav-btn, .nav-actions a');
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeNavbar();
      });
    });

    // Close navbar when clicking on brand logo
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
      navbarBrand.addEventListener('click', function() {
        closeNavbar();
      });
    }
  }

  // Initialize immediately, and also after a short delay to ensure Bootstrap is loaded
  initNavbarClose();
  
  // Retry after Bootstrap might have loaded
  setTimeout(initNavbarClose, 100);
});

// Toast Notification Utility
function showToast(message, type = 'info', title = null) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Map types to icons
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  // Default titles
  const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  
  const icon = iconMap[type] || iconMap.info;
  const toastTitle = title || titleMap[type] || titleMap.info;

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${toastTitle}</div>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Close button functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Auto remove after 5 seconds
  const autoRemove = setTimeout(() => {
    removeToast(toast);
  }, 5000);

  // Pause auto-remove on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(autoRemove);
  });

  toast.addEventListener('mouseleave', () => {
    setTimeout(() => {
      removeToast(toast);
    }, 5000);
  });

  return toast;
}

function removeToast(toast) {
  toast.classList.add('hiding');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    // Remove container if empty
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

// Convenience functions (make them globally available)
window.showToast = showToast;
window.showErrorToast = function(message, title = 'Error') {
  return showToast(message, 'error', title);
};
window.showSuccessToast = function(message, title = 'Success') {
  return showToast(message, 'success', title);
};
window.showWarningToast = function(message, title = 'Warning') {
  return showToast(message, 'warning', title);
};
window.showInfoToast = function(message, title = 'Information') {
  return showToast(message, 'info', title);
};
