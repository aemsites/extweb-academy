/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    const cells = [...row.children];

    // Detect single-column rows and add a class
    if (cells.length === 1) {
      tr.classList.add('single-column-row');
    } else {
      // Add class for multi-column rows (2+ columns)
      tr.classList.add('multi-column-row');
    }

    cells.forEach((cell, colIndex) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');

      // Add column index class for targeting specific columns with CSS
      td.classList.add(`col-${colIndex + 1}`);

      // Check if cell has a data-width attribute and apply it
      const cellWidth = cell.getAttribute('data-width');
      if (cellWidth) {
        td.style.width = cellWidth;
      }

      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });
  table.append(thead, tbody);
  block.replaceChildren(table);
}
