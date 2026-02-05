/**
 * Mobile Navigation Handler
 * WCAG 2.2 AA Compliant
 */

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');
  
  if (!navToggle || !navMobile) return;
  const navLinks = navMobile.querySelectorAll('a');

  // Header hide on scroll (mobile)
  const header = document.querySelector('header');
  let lastScrollTop = 0;
  let ticking = false;
  
  function updateHeaderVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Hide header when scrolling down, show when scrolling up
    // Only on mobile (check if nav-toggle is visible)
    if (window.getComputedStyle(navToggle).display !== 'none') {
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.classList.add('hide-header');
      } else {
        // Scrolling up
        header.classList.remove('hide-header');
      }
    } else {
      // Desktop - ensure header is visible
      header.classList.remove('hide-header');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderVisibility);
      ticking = true;
    }
  });
  
  // Toggle mobile navigation
  navToggle.addEventListener('click', function() {
    const isOpen = navMobile.classList.contains('open');
    if (isOpen) {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
      navToggle.focus();
    } else {
      navMobile.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.textContent = '✕';
      // Move focus to first nav link for keyboard users
      if (navLinks.length) navLinks[0].focus();
    }
  });
  
  // Close on navigation link click
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    }
  });
  
  // Close when clicking outside
  document.addEventListener('click', function(e) {
    if (!navMobile.contains(e.target) && !navToggle.contains(e.target)) {
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    }
  });
});
