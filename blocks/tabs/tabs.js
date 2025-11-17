// eslint-disable-next-line import/no-unresolved
import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function decorateImageTextPanel(tabpanel) {
  // Find the image and text content
  const children = [...tabpanel.children];
  let imageElement = null;
  let textContent = [];
  
  // Skip first child (it's the tab title placeholder after processing)
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const picture = child.querySelector('picture');
    
    if (picture && !imageElement) {
      imageElement = picture;
    } else if (child.textContent.trim() && child.textContent.trim() !== 'image-text') {
      textContent.push(child);
    }
  }
  
  // Create the image-text container
  const container = document.createElement('div');
  container.className = 'image-text-container';
  
  // Add optimized image if found
  if (imageElement) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-text-image';
    const img = imageElement.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      imageWrapper.appendChild(optimizedPic);
    } else {
      imageWrapper.appendChild(imageElement);
    }
    container.appendChild(imageWrapper);
  }
  
  // Add text content if found
  if (textContent.length > 0) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'image-text-content';
    textContent.forEach(element => {
      textWrapper.appendChild(element.cloneNode(true));
    });
    container.appendChild(textWrapper);
  }
  
  // Replace panel content
  tabpanel.innerHTML = '';
  tabpanel.appendChild(container);
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
    
    // Check if this is an image-text tab
    const isImageText = tabpanel.textContent.includes('image-text');
    
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    
    if (isImageText) {
      tabpanel.setAttribute('data-tab-type', 'image-text');
    }

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
    
    // Decorate image-text panels
    if (tabpanel.getAttribute('data-tab-type') === 'image-text') {
      decorateImageTextPanel(tabpanel);
    }
  });

  block.prepend(tablist);
}
