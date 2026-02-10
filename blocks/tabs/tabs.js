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
  const tabIds = [];
  tabs.forEach((tab, i) => {
    const tabItem = block.children[i];
    const id = toClassName(tab.textContent);
    const tabIdEl = tabItem.querySelector('[class*="tab-id"]') || tabItem.children[1];
    const tabId = (tabItem.dataset.tabId || tabIdEl?.textContent?.trim() || String(i + 1)).trim();
    if (tabIdEl && tabIdEl.parentElement === tabItem) tabIdEl.remove();
    tabIds.push({ tabId, index: i });

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.dataset.tabId = tabId;

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.dataset.tabId = tabId;

    moveInstrumentation(tab.parentElement, tabpanel.lastElementChild);
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener(triggerEvent, () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      if (tabId) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${encodeURIComponent(tabId)}`);
      }
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  block.prepend(tablist);

  // open tab from URL hash on load
  const hash = window.location.hash.slice(1);
  if (hash) {
    const decodedHash = decodeURIComponent(hash);
    const match = tabIds.find(({ tabId }) => tabId === decodedHash);
    if (match && match.index > 0) {
      const targetPanel = block.querySelector(`[data-tab-id="${CSS.escape(decodedHash)}"][role="tabpanel"]`);
      const targetButton = tablist.querySelector(`button[data-tab-id="${CSS.escape(decodedHash)}"]`);
      if (targetPanel && targetButton) {
        block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
          panel.setAttribute('aria-hidden', true);
        });
        tablist.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('aria-selected', false);
        });
        targetPanel.setAttribute('aria-hidden', false);
        targetButton.setAttribute('aria-selected', true);
      }
    }
  }
}
