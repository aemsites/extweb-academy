/** Needed for icons
 * Create an element with the given id and classes.
 * @param {string} tagName the tag
 * @param {string[]|string} classes the class or classes to add
 * @param {object} props any other attributes to add to the element
 * @param {string|Element} html content to add
 * @returns the element
 */
export function createElement(tagName, classes, props, html) {
    const elem = document.createElement(tagName);
    if (classes) {
      const classesArr = (typeof classes === 'string') ? [classes] : classes;
      elem.classList.add(...classesArr);
    }
    if (props) {
      Object.keys(props).forEach((propName) => {
        elem.setAttribute(propName, props[propName]);
      });
    }
    if (html) { // added for templates feature
      const appendEl = (el) => {
        if (el instanceof HTMLElement || el instanceof SVGElement) {
          elem.append(el);
        } else {
          elem.insertAdjacentHTML('beforeend', el);
        }
      };
  
      if (Array.isArray(html)) {
        html.forEach(appendEl);
      } else {
        appendEl(html);
      }
    }
  
    return elem;
  }
  
  /**
     * Sanitizes a name for use as class name.
     * @param {string} name The unsanitized name
     * @returns {string} The class name
     */
  export function toClassName(name) {
    return typeof name === 'string'
      ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : '';
  }
  
  /**
     * Find and return the library metadata info.
     * @param {Element} elem the page/block element containing the library metadata block
     */
  export function getLibraryMetadata(elem) {
    const config = {};
    const libMeta = elem.querySelector('div.library-metadata');
    if (libMeta) {
      libMeta.querySelectorAll(':scope > div').forEach((row) => {
        if (row.children) {
          const cols = [...row.children];
          if (cols[1]) {
            const name = toClassName(cols[0].textContent);
            const value = row.children[1].textContent;
            config[name] = value;
          }
        }
      });
    }
  
    return config;
  }
  
  export async function fetchBlockPage(path) {
    if (!window.blocks) {
      window.blocks = {};
    }
    if (!window.blocks[path]) {
      const resp = await fetch(`${path}.plain.html`);
      if (!resp.ok) return '';
  
      const html = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      window.blocks[path] = doc;
    }
  
    return window.blocks[path];
  }
  
  export function renderScaffolding() {
    return createElement('div', 'block-library', {}, createElement('sp-split-view', '', {
      'primary-size': '350',
      dir: 'ltr',
      'splitter-pos': '250',
      resizable: '',
    }, [
      createElement('div', 'menu', {}, [
        createElement('div', 'list-container'),
      ]),
      createElement('div', 'content'),
    ]));
  }
  
  /**
     * Copies to the clipboard
     * @param {Blob} blob The data
     */
  export async function createCopy(blob) {
    // eslint-disable-next-line no-undef
    const data = [new ClipboardItem({ [blob.type]: blob })];
    await navigator.clipboard.write(data);
  }
  
  export function processMarkup(pageBlock, path) {
    const copy = pageBlock.cloneNode(true);
    const url = new URL(path);
    copy.querySelectorAll('img').forEach((img) => {
      const srcSplit = img.src.split('/');
      const mediaPath = srcSplit.pop();
      img.src = `${url.origin}/${mediaPath}`;
      const { width, height } = img;
      const ratio = width > 450 ? 450 / width : 1;
      img.width = width * ratio;
      img.height = height * ratio;
    });
  
    copy.querySelector('div.library-metadata')?.remove();
  
    return copy;
  }
  
  export async function copyBlock(pageBlock, path, container) {
    const processed = processMarkup(pageBlock, path);
    const blob = new Blob([processed.innerHTML], { type: 'text/html' });
    try {
      await createCopy(blob);
      // Show toast
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: 'Copied Block' } }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
      container.dispatchEvent(new CustomEvent('Toast', { detail: { message: err.message, variant: 'negative' } }));
    }
  }
  
  // Need to copy this here since only the Blocks feature uses it from helix source
  export function initSplitFrame(content) {
    const contentContainer = content.querySelector('.content');
    if (contentContainer.querySelector('sp-split-view')) {
      // already initialized
      return;
    }
  
    contentContainer.append(createElement('sp-split-view', '', {
      vertical: '',
      resizable: '',
      'primary-size': '2600',
      'secondary-min': '200',
      'splitter-pos': '250',
    }, [
      createElement('div', 'view', {}, [
        createElement('div', 'action-bar', {}, [
          createElement('sp-action-group', '', { compact: '', selects: 'single', selected: 'desktop' }, [
            createElement('sp-action-button', '', { value: 'mobile' }, [
              createElement('sp-icon-device-phone', '', { slot: 'icon' }),
              'Mobile',
            ]),
            createElement('sp-action-button', '', { value: 'tablet' }, [
              createElement('sp-icon-device-tablet', '', { slot: 'icon' }),
              'Tablet',
            ]),
            createElement('sp-action-button', '', { value: 'desktop' }, [
              createElement('sp-icon-device-desktop', '', { slot: 'icon' }),
              'Desktop',
            ]),
          ]),
          createElement('sp-divider', '', { size: 's' }),
        ]),
        createElement('div', 'frame-view', {}),
      ]),
      createElement('div', 'details-container', {}, [
        createElement('div', 'action-bar', {}, [
          createElement('h3', 'block-title'),
          createElement('div', 'actions', {}),
        ]),
        createElement('sp-divider', '', { size: 's' }),
        createElement('div', 'details'),
      ]),
    ]));
  
    const actionGroup = content.querySelector('sp-action-group');
    actionGroup.selected = 'desktop';
  
    const frameView = content.querySelector('.frame-view');
    const mobileViewButton = content.querySelector('sp-action-button[value="mobile"]');
    mobileViewButton?.addEventListener('click', () => {
      frameView.style.width = '480px';
    });
  
    const tabletViewButton = content.querySelector('sp-action-button[value="tablet"]');
    tabletViewButton?.addEventListener('click', () => {
      frameView.style.width = '768px';
    });
  
    const desktopViewButton = content.querySelector('sp-action-button[value="desktop"]');
    desktopViewButton?.addEventListener('click', () => {
      frameView.style.width = '100%';
    });
  }
  
  export async function renderPreview(pageBlock, path, previewContainer) {
    const frame = createElement('iframe');
  
    const blockPageResp = await fetch(path);
    if (!blockPageResp.ok) {
      return;
    }
  
    const html = await blockPageResp.text();
    const parser = new DOMParser();
    const blockPage = parser.parseFromString(html, 'text/html');
  
    const blockPageDoc = blockPage.documentElement;
    const blockPageMain = blockPageDoc.querySelector('main');
  
    blockPageDoc.querySelector('header').style.display = 'none';
    blockPageDoc.querySelector('footer').style.display = 'none';
    blockPageMain.replaceChildren(processMarkup(pageBlock, path));
  
    frame.srcdoc = blockPageDoc.outerHTML;
    frame.style.display = 'block';
  
    frame.addEventListener('load', () => {
      // todo
    });
  
    previewContainer.innerHTML = '';
    previewContainer.append(frame);
  }