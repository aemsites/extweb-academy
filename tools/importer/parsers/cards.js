/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant (left-right-card, xwalk with field hinting).
 * Base block: cards
 * Selector: .list_navigation
 * Source: World Bank Academy topic page
 *
 * Model fields (from _cards.json, per card item):
 *   - image (reference) — card thumbnail
 *   - text (richtext) — card body content
 *
 * Output: Cards (left-right-card) block table with one row per card,
 *         two cells per row: <!-- field:image --> picture | <!-- field:text --> rich text
 */
export default function parse(element, { document }) {
    const cardItems = element.querySelectorAll('li.lp__list_navigation_section');
  
    const cells = [];
  
    cardItems.forEach((card) => {
      // Cell 1: Card image with field hint
      const img = card.querySelector('.lp__lg_horizontal_img img');
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      if (img) {
        imageCell.appendChild(img);
      }
  
      // Cell 2: Rich text content with field hint
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
  
      // Extract linked title and create as H3
      const titleLink = card.querySelector('.lp__list_navigation_title a');
      if (titleLink) {
        const h3 = document.createElement('h3');
        const link = document.createElement('a');
        link.href = titleLink.href;
        link.textContent = titleLink.textContent.trim();
        h3.appendChild(link);
        textCell.appendChild(h3);
      }
  
      // Extract subtitle / hammer text as paragraph
      const hammer = card.querySelector('.lp__hammer');
      if (hammer) {
        const subtitle = document.createElement('p');
        subtitle.textContent = hammer.textContent.trim();
        textCell.appendChild(subtitle);
      }
  
      // Extract description paragraph
      const description = card.querySelector('.lp__blurb_text p');
      if (description) {
        textCell.appendChild(description);
      }
  
      cells.push([imageCell, textCell]);
    });
  
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Cards (left-right-card)',
      cells,
    });
  
    element.replaceWith(block);
  }
  