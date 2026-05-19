/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: World Bank Academy cleanup.
 * Removes non-authorable content from World Bank Academy pages.
 * All selectors verified against captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent popup (line 2369: <section id="cookieconsentpopup" class="lp__cookie_tooltip">)
    WebImporter.DOMUtils.remove(element, ['#cookieconsentpopup']);

    // Adobe tracking iframe (line 1841: <iframe id="destination_publishing_iframe_worldbank_0">)
    WebImporter.DOMUtils.remove(element, ['#destination_publishing_iframe_worldbank_0']);

    // Qualtrics feedback widget (line 2379: <div id="ZN_ahoepSezTqpB2GV">)
    WebImporter.DOMUtils.remove(element, ['#ZN_ahoepSezTqpB2GV']);

    // Facebook SDK root (line 2383: <div id="fb-root">)
    WebImporter.DOMUtils.remove(element, ['#fb-root']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Site-wide header (line 4: <header>)
    WebImporter.DOMUtils.remove(element, ['header']);

    // Site-wide footer (line 2177: <footer class="footer-wrapper">)
    WebImporter.DOMUtils.remove(element, ['footer.footer-wrapper']);

    // Academy sub-header/navigation inside main (line 1845: <div class="acheader iparsys parsys">)
    WebImporter.DOMUtils.remove(element, ['.acheader']);

    // Note: .lang-toggler contains the breadcrumb — NOT removed (handled by breadcrumb parser)

    // Metadata div (line 2: <div class="wb_metadata">)
    WebImporter.DOMUtils.remove(element, ['.wb_metadata']);

    // Remaining iframes, link tags, noscript elements
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'noscript']);
  }
}
