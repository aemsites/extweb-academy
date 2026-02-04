import {
  loadHeader,
  loadFooter,
  buildBlock,
  decorateBlock,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';
import { picture, source, img } from './dom-helpers.js';

// eslint-disable-next-line import/no-cycle
import {
  getLanguage,
} from './utils.js';

export const LANGUAGE_ROOT = `/${getLanguage()}`;

/**
 * Function to add a div inside .hero-video-section with the class 'color-wrapper',
 * and within that div add two div sibling divs with classes 'gradient-left-side'
 * and 'gradient-right-side', and add the class 'color-animation' to both these divs
 */
function addColorWrapper() {
  const heroSection = document.querySelector('.section.hero-video-section');
  // Check if hero section exists (homepage only)
  if (!heroSection) {
    return;
  }

  // Check if color-wrapper already exists
  if (heroSection.querySelector('.color-wrapper')) {
    return;
  }

  const colorWrapper = document.createElement('div');
  colorWrapper.classList.add('color-wrapper');
  heroSection.insertBefore(colorWrapper, heroSection.firstChild);
  const gradientLeftSide = document.createElement('div');
  gradientLeftSide.classList.add('gradient-left-side');
  gradientLeftSide.classList.add('color-animation');
  colorWrapper.appendChild(gradientLeftSide);
  const gradientRightSide = document.createElement('div');
  gradientRightSide.classList.add('gradient-right-side');
  gradientRightSide.classList.add('color-animation');
  colorWrapper.appendChild(gradientRightSide);

  // Add event listener to the color wrapper to add the class 'centered' when section is in view
  document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.color-wrapper');

    // Select all sections to observe (excludes hero section)
    const centerSections = document.querySelectorAll('.section:not(.hero-video-section)');

    // Track if user has scrolled to minimize CLS on initial load
    let hasScrolled = false;

    window.addEventListener('scroll', () => {
      hasScrolled = true;
    }, { once: true });

    const observer = new IntersectionObserver(
      (entries) => {
        // Only animate after user has scrolled to reduce CLS impact
        if (!hasScrolled) return;

        const anyInView = entries.some((entry) => entry.isIntersecting);
        if (anyInView) {
          wrapper.classList.add('centered');
        } else {
          wrapper.classList.remove('centered');
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
      },
    );

    centerSections.forEach((section) => observer.observe(section));
  });
}

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Decorates Dynamic Media images by modifying their URLs to include specific parameters
 * and creating a <picture> element with different sources for different image formats and sizes.
 *
 * @param {HTMLElement} main - The main container element that includes the links to be processed.
 */
export async function decorateDMImagesWithRendition(
  image,
  imageRatio,
  modifiers,
  disableSmartCrop,
  title,
  alt,
  aspectRatioDiv,
  objectPosDiv,
  loadingValue,
) {
  const getText = (el, defaultValue = '') => {
    if (el instanceof Element) {
      const p = el.querySelector('p');
      return p ? p.textContent.trim() : defaultValue;
    }
    return defaultValue;
  };

  const imageRendition = getText(imageRatio);
  const quality = getText(modifiers, 'quality=85');
  const isDisable = getText(disableSmartCrop, 'false');
  const aspectRatio = getText(aspectRatioDiv);
  const objectPos = getText(objectPosDiv);
  const altValue = getText(alt);
  const titleValue = getText(title);

  if (!loadingValue) {
    // eslint-disable-next-line no-param-reassign
    loadingValue = 'lazy';
  }

  const sources = [];
  const deliveryLink = image.querySelector('a[href^="https://delivery-p"]');

  if (deliveryLink) {
    const url = new URL(deliveryLink.href.split('?')[0]);
    const originalHref = url.href;

    const fileName = originalHref.substring(originalHref.lastIndexOf('/') + 1);
    const altText = fileName.substring(0, fileName.lastIndexOf('.'));

    const imgEl = img({
      loading: loadingValue,
      alt: altValue !== '' ? altValue : altText,
      title: titleValue !== '' ? titleValue : altText,
      src: originalHref.replace('/original', ''),
    });

    // case: AEMaaCS DAM asset
    if (url.hostname.endsWith('.adobeaemcloud.com')) {
      if (imageRendition !== '' && isDisable === 'false') {
        let metaPath = url.pathname.replace('/original', '');
        const asIndex = metaPath.indexOf('/as/');
        if (asIndex !== -1) {
          metaPath = metaPath.substring(0, asIndex);
        }
        const metadataUrl = `${url.origin}${metaPath}/metadata`;

        let availableRenditions = {};
        try {
          const resp = await fetch(metadataUrl);
          if (resp.ok) {
            const json = await resp.json();
            availableRenditions = json?.repositoryMetadata?.smartcrops || {};
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch metadata:', e);
        }

        const breakpoints = imageRendition.split(',').reduce((acc, item) => {
          const [resolution, size] = item.split(':');
          if (!resolution || !size) return acc;
          const [width, height] = size.split('x').map(Number);
          if (width && height) {
            acc[Number(resolution)] = { width, height };
          }
          return acc;
        }, {});
        const sortedBps = Object.entries(breakpoints).sort((a, b) => Number(b[0]) - Number(a[0]));

        const [largestData] = sortedBps[0];
        const largestKey = `${largestData.width}x${largestData.height}`;
        let largestRenditionHref = originalHref;
        largestRenditionHref = originalHref.replace('/original', '');

        sortedBps.forEach(([bp, { width, height }]) => {
          const key = `${width}x${height}`;
          let renditionHref = originalHref;
          renditionHref = renditionHref.replace('/original', '');

          if (availableRenditions[key]) {
            sources.push(
              source({
                type: 'image/webp',
                media: `(min-width: ${bp}px)`,
                srcset: `${renditionHref}?${quality}&smartcrop=${key}`,
              }),
            );
          } else {
            sources.push(
              source({
                type: 'image/webp',
                media: `(min-width: ${bp}px)`,
                srcset: `${renditionHref}?${quality}&smartcrop=${key}`,
              }),
            );
          }
        });
        imgEl.src = `${largestRenditionHref}?${quality}&smartcrop=${largestKey}`;
        imgEl.style.aspectRatio = 'auto';
        imgEl.style.objectPosition = 'initial';
      } else {
        // case: Dynamic Media asset
        if (quality !== '') {
          const imgSrc = originalHref.replace('/original', '');
          imgEl.src = `${imgSrc}?${quality}`;
        }
        if (aspectRatio !== '') {
          imgEl.style.aspectRatio = aspectRatio;
        }
        if (objectPos !== '') {
          imgEl.style.objectPosition = objectPos;
        }
      }
      const parent = deliveryLink.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'p') {
        parent.replaceWith(picture(...sources, imgEl));
      } else {
        deliveryLink.replaceWith(picture(...sources, imgEl));
      }
    }
  } else {
    const pictureTag = image.querySelector('picture');
    if (pictureTag) {
      const pic = pictureTag.querySelector('img');
      if (altValue !== '') {
        pic.alt = altValue;
      } else {
        pic.alt = 'default alt';
      }
      if (aspectRatio !== '') {
        pic.style.aspectRatio = aspectRatio;
      }
      if (objectPos !== '') {
        pic.style.objectPosition = objectPos;
      }

      if (pic) {
        const newImg = pic.cloneNode(true); // clone so we don't lose it
        pictureTag.innerHTML = ''; // clear all children
        pictureTag.appendChild(newImg); // put back only <img>
      }

      const parent = pictureTag.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'p') {
        parent.replaceWith(pictureTag);
      }
    }
  }
  [imageRatio, alt, modifiers, disableSmartCrop, aspectRatioDiv, objectPosDiv].forEach((el) => {
    if (el instanceof Element) el.remove();
  });
}

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

/**
 * Determines if the current page should have auto-breadcrumbs based on path level.
 * @returns {boolean} true if path has more than 2 segments
 */
function shouldHaveAutoBreadcrumbs() {
  const pathSegments = window.location.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  return pathSegments.length > 2;
}

/**
 * Builds auto-breadcrumb block if needed.
 * Prepends breadcrumb to the first section in main if:
 * - Path level is greater than 2
 * - No breadcrumb block already exists on the page
 * - disableBreadcrumbs meta property is not set to 'true'
 * @param {Element} main The main container element
 */
function buildAutoBreadcrumbs(main) {
  // Only add auto-breadcrumbs to the document's main element, not fragments
  if (main !== document.querySelector('main')) {
    return;
  }

  // Use a flag on the window to prevent multiple executions
  if (window.autoBreadcrumbAdded) {
    return;
  }

  // Check if breadcrumbs are disabled via page metadata
  if (getMetadata('disablebreadcrumbs') === 'true') {
    return;
  }

  // Check if breadcrumb already exists in the main element
  if (main.querySelector('.breadcrumb')) {
    return;
  }

  // Check if path level is > 2
  if (!shouldHaveAutoBreadcrumbs()) {
    return;
  }

  // Find the first section (div) in main to prepend breadcrumb to
  const firstSection = main.querySelector(':scope > div');
  if (!firstSection) {
    return;
  }

  // Set flag immediately to prevent concurrent calls
  window.autoBreadcrumbAdded = true;

  // Create the breadcrumb block and prepend it to the first section
  // decorateSections will wrap it in .breadcrumb-wrapper
  const breadcrumbBlock = buildBlock('breadcrumb', '');
  firstSection.prepend(breadcrumbBlock);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildAutoBreadcrumbs(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  buildFragmentBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  addColorWrapper();
}

/**
 * Loads a template.
 * @param {Element} doc The container element
 * @param {string} templateName The name of the template
 */
async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(`../templates/${templateName}/${templateName}.js`);
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const templateName = getMetadata('template');
  // Skip CSS loading for program-detail (already loaded in loadEager)
  // but still load JS functionality
  if (templateName === 'program-detail') {
    try {
      const module = await import(`../templates/${templateName}/${templateName}.js`);
      if (module.default) {
        await module.default(doc);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load module for ${templateName}`, error);
    }
  } else if (templateName) {
    await loadTemplate(doc, templateName);
  }

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Fetch filtered search results
 * @returns List of search results
 */
export async function fetchSearch() {
  window.searchData = window.searchData || {};
  if (Object.keys(window.searchData).length === 0) {
    const path = '/query-index.json?limit=500&offset=0';
    const resp = await fetch(path);
    window.searchData = JSON.parse(await resp.text()).data;
  }
  return window.searchData;
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
