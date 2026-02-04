/* program detail - inject critical CSS immediately */

// Inject critical CSS as inline style to prevent CLS on mobile only
(function injectCriticalCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 1023px) {
      body.program-detail .columns-container .columns-wrapper {
        min-height: 650px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();
