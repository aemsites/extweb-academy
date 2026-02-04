/* program detail - inject critical CSS immediately */

// Inject critical CSS as inline style to prevent CLS
// This runs immediately when the script loads, before any blocks are decorated
(function injectCriticalCSS() {
  const style = document.createElement('style');
  style.textContent = `
    body.program-detail .columns-wrapper:has(.columns-2-cols) {
      min-height: 500px !important;
    }
  `;
  document.head.appendChild(style);
})();
