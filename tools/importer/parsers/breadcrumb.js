/* eslint-disable */
/* global WebImporter */

/**
 * Parser for breadcrumb block (xwalk).
 * Base block: breadcrumb
 * Selector: .lp__breadcrumb
 * Source: World Bank Academy pages
 *
 * The breadcrumb block has no model fields — it auto-generates
 * from the page path. Output is an empty block table.
 */
export default function parse(element, { document }) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Breadcrumb',
      cells: [],
    });
  
    element.replaceWith(block);
  }
  