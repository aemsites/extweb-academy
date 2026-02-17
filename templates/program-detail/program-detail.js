/**
 * Program Detail Template JavaScript
 * 
 * This file handles CLS (Cumulative Layout Shift) prevention by ensuring
 * images have proper dimensions before they load.
 */

/**
 * Ensures images in the hero section have width and height attributes
 * to prevent CLS. This is a fallback if images don't have these attributes
 * set in the HTML.
 */
function ensureImageDimensions() {
  const heroImage = document.querySelector(
    'body.program-detail .columns.columns-2-cols > div > div:last-child picture img'
  );
  
  if (heroImage && !heroImage.hasAttribute('width') && !heroImage.hasAttribute('height')) {
    // Wait for image to load to get natural dimensions
    if (heroImage.complete) {
      setImageDimensions(heroImage);
    } else {
      heroImage.addEventListener('load', () => {
        setImageDimensions(heroImage);
      }, { once: true });
    }
  }
}

/**
 * Sets width and height attributes on an image element
 * @param {HTMLImageElement} img - The image element
 */
function setImageDimensions(img) {
  if (img.naturalWidth && img.naturalHeight) {
    img.setAttribute('width', img.naturalWidth);
    img.setAttribute('height', img.naturalHeight);
  }
}

/**
 * Main function to initialize program-detail template enhancements
 * @param {Document} doc - The document to process
 */
export default async function decorate(doc) {
  // Ensure images have dimensions to prevent CLS
  ensureImageDimensions();
  
  // Re-check after a short delay in case images load asynchronously
  setTimeout(() => {
    ensureImageDimensions();
  }, 100);
}
