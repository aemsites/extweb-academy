import {
  div, p, section, a, button,
  span,
} from './dom-helpers.js';
import { fetchLanguagePlaceholders } from './scripts.js';

export const PATH_PREFIX = '/ext';
export const TAG_ROOT = 'world-bank:';
export const SUPPORTED_LANGUAGES = ['en', 'zh', 'ru', 'fr', 'es', 'ar', 'ja'];
export const RTL_LANGUAGES = ['ar']; // list of RTL Languages
export const INTERNAL_PAGES = ['/footer', '/nav', '/fragments', '/data', '/drafts'];

let lang;

/**
 * Process current pathname and return details for use in language switching
 * Considers pathnames like /en/path/to/content and
 * /content/world-bank/global/en/path/to/content.html for both EDS and AEM
 */
export function getPathDetails() {
  const { pathname } = window.location;
  const isContentPath = pathname.startsWith('/content');
  const parts = pathname.split('/');
  const safeLangGet = (index) => (parts.length > index ? parts[index] : 'en');
  /* 5 is the index of the language in the path for AEM content paths like
     /content/world-bank/corporate/ext/en/path/to/content.html
     2 is the index of the language in the path for EDS paths like /en/path/to/content
    */
  let langCode = isContentPath ? safeLangGet(5) : safeLangGet(2);
  // remove suffix from lang if any
  if (langCode.indexOf('.') > -1) {
    langCode = langCode.substring(0, langCode.indexOf('.'));
  }
  if (!langCode) langCode = 'en'; // default to en
  // substring before lang
  const prefix = pathname.substring(0, pathname.indexOf(`/${langCode}`)) || '';
  const suffix = pathname.substring(pathname.indexOf(`/${langCode}`) + langCode.length + 1) || '';
  return {
    prefix,
    suffix,
    langCode,
    isContentPath,
  };
}

/**
 * Fetch and return language of current page.
 * @returns language of current page
 */
export function getLanguage() {
  if (!lang) {
    lang = getPathDetails().langCode;
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      lang = 'en';
    }
  }
  return lang;
}

export function setPageLanguage() {
  const currentLang = getLanguage();
  document.documentElement.lang = currentLang;
  if (RTL_LANGUAGES.includes(currentLang)) {
    document.documentElement.dir = 'rtl';
  }
}

/**
 * Remove prefix from tag
 * @param {*} tag
 * @returns
 */
export function processTags(tag, prefix = '') {
  if (tag) {
    return tag.replace(TAG_ROOT, '').replace(`${prefix}/`, '');
  }
  return null;
}

/**
 * Gets taxonomy object.
 *
 * @returns {object} Window taxonomy object
 */
// eslint-disable-next-line import/prefer-default-export
export async function fetchTaxonomy() {
  const langCode = getLanguage();
  if (!window.taxonomy) {
    window.taxonomy = window.taxonomy || {};
    let queryString = '';
    if (langCode !== 'en') {
      queryString = `?sheet=${langCode}`;
    }
    window.taxonomy = new Promise((resolve) => {
      fetch(`/ext/taxonomy.json${queryString}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        })
        .then((json) => {
          const tags = {};
          json.data
            .filter((tag) => tag.tag)
            .forEach((tag) => {
              tags[tag.tag] = tag.title;
            });
          window.taxonomy = tags;
          resolve(window.taxonomy);
        })
        .catch(() => {
          // error loading taxonomy
          window.taxonomy = {};
          resolve(window.taxonomy);
        });
    });
  }
  return window.taxonomy;
}

/**
 * Fetch localized tag from AEM taxonomy
 * @param {*} tag
 * @returns
 */
export async function getTaxonomy(tag, prefix = '') {
  const tags = await fetchTaxonomy();
  if (tags) {
    return tags[tag] || processTags(tag, prefix);
  }
  return null;
}

/**
 * Add a link tag around img tag if image is following by a tag
 * @param {*} container
 */
export function decorateLinkedPictures(container) {
  [...container.querySelectorAll('picture + br + a')]
    .filter((link) => {
      try {
        // ignore domain in comparison
        return new URL(link.href).pathname;
      } catch (e) {
        return false;
      }
    })
    .forEach((link) => {
      const picture = a.previousElementSibling.previousElementSibling;
      picture.remove();
      const br = link.previousElementSibling;
      br.remove();
      const txt = a.innerHTML;
      a.innerHTML = picture.outerHTML;
      a.setAttribute('aria-label', txt);
      a.setAttribute('title', txt);
    });
}

/**
 *
 * Helper function to create a <source> element
 *
 * @returns imageSource
 */
export function createSource(src, width, mediaQuery) {
  const { pathname } = new URL(src, window.location.href);
  const source = document.createElement('source');
  source.type = 'image/webp';
  source.srcset = `${pathname}?width=${width}&format=webply&optimize=medium`;
  source.media = mediaQuery;

  return source;
}

/**
 * Return the placeholder file specific to language
 * @returns
 */
export async function fetchLanguageNavigation(langCode) {
  window.navigationData = window.navigationData || {};

  if (!window.navigationData[langCode]) {
    window.navigationData[langCode] = new Promise((resolve) => {
      fetch(`${PATH_PREFIX}${langCode}/navigation.json`)
        .then((resp) => (resp.ok ? resp.json() : {}))
        .then((json) => {
          window.navigationData[langCode] = json.data;
          resolve(window.navigationData[langCode]);
        })
        .catch(() => {
          window.navigationData[langCode] = {};
          resolve(window.navigationData[langCode]);
        });
    });
  }
  await window.navigationData[langCode];
}

export async function fetchData(url, method = 'GET', headers = {}, body = null) {
  try {
    const options = { method, headers: { ...headers } };
    if (method === 'POST' && body) { options.headers['Content-Type'] = 'application/json'; options.body = JSON.stringify(body); }
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

/**
 * Returns the true of the current page in the browser.
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const urlParams = new URLSearchParams(window.parent.location.search);
  return `${window.parent.location.origin}${urlParams.get('path')}`;
}

/**
 * Check if a page is internal or not
 */
export function isInternalPage() {
  const pageUrl = getHref();
  // eslint-disable-next-line consistent-return
  INTERNAL_PAGES.forEach((element) => { if (pageUrl.indexOf(element) > 0) return true; });
  return false;
}

export function formatDate(dObjStr) {
  if (dObjStr) {
    const dObj = new Date(dObjStr);
    const yyyy = dObj.getFullYear();
    let mm = dObj.getMonth() + 1;
    let dd = dObj.getDate();

    if (dd < 10) dd = `0${dd}`;
    if (mm < 10) mm = `0${mm}`;

    const formatted = `${mm}-${dd}-${yyyy}`;
    return formatted;
  }
  return '';
}

/**
 * Gets the extension of a URL.
 * @param {string} url The URL
 * @returns {string} The extension
 * @private
 * @example
 * get_url_extension('https://example.com/foo.jpg');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo.jpg?bar=baz');
 * // returns 'jpg'
 * get_url_extension('https://example.com/foo');
 * // returns ''
 * get_url_extension('https://example.com/foo.jpg#qux');
 * // returns 'jpg'
 */
export function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

/**
 * Get the query string value
 * @param {*} key
 * @returns
 */
export function getQueryString(key = 'tip', path = window.location.href) {
  const pageUrl = new URL(path);
  return pageUrl.searchParams.get(key);
}

/**
 * Check if 3rd party scripts are enabled or not.
 * @returns
 */
export function scriptEnabled() {
  if (getQueryString('tip') === 'noscript') return false;

  return true;
}

const setConsentCookie = (name, value, daysToExpire, cookieSection) => {
  const currDate = new Date();
  currDate.setTime(currDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));

  const expiration = `expires=${currDate.toUTCString()}`;
  const url = new URL(window.location.href);
  const domain = `; domain=${url.hostname};`;
  document.cookie = `${name}=${value}; ${expiration}; path=/${domain}`;
  cookieSection.style.display = 'none';
};

export function cookiePopUp() {
  const consentCookie = document.cookie.replace(/(?:(?:^|.*;\s*)consent_cookie\s*=\s*([^;]*).*$)|^.*$/, '$1');
  if (consentCookie.indexOf('1') >= 0) {
    return;
  }

  const cookieSection = section({ class: 'cookie-tooltip', style: 'display:none;' });
  const placeholders = window.placeholders[`${PATH_PREFIX}/${getLanguage()}`] || {};
  const hasCookieText = !!(placeholders && placeholders.cookiePopUpText);
  if (!hasCookieText) return;

  const cookiePopUpTextElement = p(
    { tabindex: 0 },
  );
  cookiePopUpTextElement.innerHTML = placeholders.cookiePopUpText;

  if (placeholders.cookiePopUpLearnMoreLinkLabel) {
    cookiePopUpTextElement.append(a(
      { href: `${placeholders.cookiePopUpLearnMoreLink || '#'}` },
      `${placeholders.cookiePopUpLearnMoreLinkLabel}`,
    ));
  }

  const cookieContainer = div(
    { class: 'container' },
    cookiePopUpTextElement,
    button(
      {
        type: 'button',
        class: 'close accept-consent',
        'aria-label': `${placeholders.cookiePopUpCloseAriaLabel || 'Close Cookie Notification'}`,
        onclick: () => setConsentCookie('consent_cookie', '1', 365, cookieSection),
      },
      span(
        { 'aria-hidden': 'true' },
        '×',
      ),
    ),
  );

  cookieSection.append(cookieContainer);
  document.body.insertBefore(cookieSection, document.body.firstChild);
}

export function showCookieConsent() {
  const cookieSection = document.querySelector('.cookie-tooltip');
  if (cookieSection) {
    cookieSection.style = 'display:block;';
  }
}

/**
 * Process Dynamic media image to append query param
 * @param {*} pictureElement
 * @param {*} qParam
 */
export function dynamicMediaAssetProcess(pictureElement, qParam) {
  const queryParams = qParam.textContent.trim();
  if (queryParams.length > 0) {
    Array.from(pictureElement.children).forEach((child) => {
      const baseUrl = child.tagName === 'SOURCE' ? child.srcset.split('?')[0] : child.src.split('?')[0];
      if (child.tagName === 'SOURCE' && child.srcset) {
        child.srcset = `${baseUrl}?${queryParams}`;
      } else if (child.tagName === 'IMG' && child.src) {
        child.src = `${baseUrl}?${queryParams}`;
      }
    });
  }
}

export async function getFormattedDates(dateArray, language) {
  const languagePlaceholders = await fetchLanguagePlaceholders();
  const dateFormat = languagePlaceholders.dateFormat || 'x';
  const postData = {
    dateFormat,
    locale: language,
    hasLocale: 'true',
    hasDateFormat: dateFormat === 'x' ? 'false' : 'true',
    dateArray,
  };
  return fetchData('/wbg/aem/service/dateformat', 'POST', {}, postData);
}

export async function fetchCountriesList() {
  return fetch(`${PATH_PREFIX}/${getLanguage()}/country-list.json`)
    .then((resp) => (resp.ok ? resp.json() : {}))
    .then((json) => (json && Object.hasOwn(json, 'data') ? json.data : []))
    .catch((error) => {
      console.log('failed to get countries list', error);
    });
}
