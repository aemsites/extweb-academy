// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // check if this is a vertical variant
  const isVertical = block.classList.contains('vertical');
  const triggerEvent = isVertical ? 'mouseenter' : 'click';

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const tabItem = block.children[i];
    const id = toClassName(tab.textContent);
    const tabIdEl = tabItem.querySelector('[class*="tab-id"]');
    const tabId = (tabIdEl?.textContent?.trim() || String(i + 1)).trim();

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
    button.dataset.tabId = tabId;
    button.addEventListener(triggerEvent, () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(tabId)}`;
      window.history.replaceState(null, '', url);
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  block.prepend(tablist);

  // open tab from URL hash on load (e.g. /#2 selects tab with id "2")
  const hash = window.location.hash.slice(1);
  if (hash) {
    const tabIdFromUrl = decodeURIComponent(hash).trim();
    const buttons = tablist.querySelectorAll('button');
    const panels = block.querySelectorAll('[role=tabpanel]');
    const idx = [...buttons].findIndex((btn) => btn.dataset.tabId === tabIdFromUrl);
    if (idx >= 0 && panels[idx]) {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      panels[idx].setAttribute('aria-hidden', false);
      buttons[idx].setAttribute('aria-selected', true);
    }
  }
}
