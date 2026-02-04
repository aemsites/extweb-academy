/* program detail - CRITICAL: Inject CSS immediately to prevent CLS */

// This IIFE runs immediately when script loads (before block decoration)
(function() {
  // Only run on mobile
  if (window.innerWidth > 767) return;
  
  const style = document.createElement('style');
  style.textContent = `
    body.program-detail .columns-2-cols img {
      aspect-ratio: 16 / 9 !important;
      min-height: 211px !important;
    }
    body.program-detail .columns-2-cols > div > div:first-child {
      min-height: 300px !important;
    }
    body.program-detail .columns-wrapper {
      min-height: 500px !important;
    }
  `;
  
  // Insert as first style in head for highest priority
  const firstStyle = document.querySelector('head style');
  if (firstStyle) {
    document.head.insertBefore(style, firstStyle);
  } else {
    document.head.appendChild(style);
  }
})();
