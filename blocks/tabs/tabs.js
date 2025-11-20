// eslint-disable-next-line import/no-unresolved
import { toClassName, buildBlock, decorateBlock } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * check if link text is same as the href
 * @param {Element} link the link element
 * @returns {boolean} true or false
 */
export function linkTextIncludesHref(link) {
  const href = link.getAttribute('href');
  const textcontent = link.textContent;

  return textcontent.includes(href);
}

/**
   * Builds fragment blocks from links to fragments
   * @param {Element} main The container element
   */
export function buildFragmentBlocks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href);
    if (linkTextIncludesHref(a) && url.pathname.includes('/fragments/')) {
      const block = buildBlock('fragment', url.pathname);
      const parent = a.parentElement;
      a.replaceWith(block);
      decorateBlock(block);
      if (parent.tagName === 'P' && parent.querySelector('.block')) {
        const div = document.createElement('div');
        div.className = parent.className;
        while (parent.firstChild) div.appendChild(parent.firstChild);
        parent.replaceWith(div);
      }
    }
  });
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;

    moveInstrumentation(tab.parentElement, tabpanel.lastElementChild);
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  block.prepend(tablist);
  buildFragmentBlocks(block);
}
