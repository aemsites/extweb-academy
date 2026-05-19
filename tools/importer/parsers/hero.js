/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant (xwalk project with field hinting).
 * Base block: hero
 * Selector: .supergrid .gridlayout:first-child
 * Source: https://academy.worldbank.org/en/prosperity/poverty
 *
 * Model fields (from _hero.json):
 *   - image (reference) — collapsed with imageAlt
 *   - imageAlt (text) — collapsed into image, no separate row
 *   - text (richtext)
 *
 * Target table:
 *   Row 1: <!-- field:image --> + picture element
 *   Row 2: <!-- field:text --> + heading (H1)
 */
export default function parse(element, { document }) {
    const heading = element.querySelector('.lp__heading_v1 h1, h1.h1, h1');
  
    const nextGridLayout = element.nextElementSibling;
    let image = null;
    if (nextGridLayout) {
      image = nextGridLayout.querySelector('.redesign_image .lp__image_components picture')
        || nextGridLayout.querySelector('.lp__image_components picture')
        || nextGridLayout.querySelector('picture')
        || nextGridLayout.querySelector('img');
    }
  
    if (!heading) {
      return;
    }
  
    const cells = [];
  
    // Row 1: image with field hint
    if (image) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(image);
      cells.push([imageCell]);
    }
  
    // Row 2: text (heading) with field hint
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textCell.appendChild(heading);
    cells.push([textCell]);
  
    const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
    element.replaceWith(block);
  }
  