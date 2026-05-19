/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: World Bank Academy sections.
 * Inserts section breaks (<hr>) and Section Metadata blocks based on template sections.
 * All selectors come from payload.template.sections (page-templates.json).
 * Verified against captured DOM (migration-work/cleaned.html):
 *   - Section 1: .supergrid .gridlayout:first-child (line 1941)
 *   - Section 2: .supergrid .gridlayout:nth-child(2) (line 1964)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    const document = element.ownerDocument;
    const sections = template.sections;

    // Process sections in reverse order to preserve DOM positions
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.parentNode.insertBefore(sectionMetadata, sectionEl.nextSibling);
      }

      // Insert <hr> before each non-first section to create section breaks
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
