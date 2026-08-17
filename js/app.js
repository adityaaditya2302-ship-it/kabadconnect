/**
 * Shared Utilities for KabadConnect
 */

// Smoothly counts up numbers
function animateCounter(element, target, duration = 2000) {
  let startTimestamp = null;
  const startValue = 0;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Easing function (easeOutExpo)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const currentValue = Math.floor(easeProgress * (target - startValue) + startValue);
    
    // Add comma formatting
    element.textContent = formatNumber(currentValue);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = formatNumber(target) + (element.dataset.suffix || '');
    }
  };
  
  window.requestAnimationFrame(step);
}

// Add commas (e.g., 1,234)
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format as kg/tonnes
function formatWeight(kg) {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(1) + ' Tonnes';
  }
  return kg + ' kg';
}

// Toast notification
function showNotification(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert-card ${type}`;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.style.animation = 'slideUp 0.3s ease';
  toast.innerHTML = `<span style="font-size: 1.2rem;">${type === 'success' ? '✅' : 'ℹ️'}</span> ${message}`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Relative time
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// Navigation active state handler
function initNav() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Trigger counters if it's a stat card
        if (entry.target.classList.contains('stat-value') && !entry.target.dataset.animated) {
          const target = parseInt(entry.target.dataset.target, 10);
          if (!isNaN(target)) {
            animateCounter(entry.target, target);
            entry.target.dataset.animated = 'true';
          }
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll, .stat-value').forEach((el) => {
    observer.observe(el);
  });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
});
