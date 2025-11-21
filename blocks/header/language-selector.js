import {
  li, ul, a, div,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';
import * as constants from './constants.js';

function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Get Language Selector Display Text based on screen size
const getLanguageDisplayText = (placeholdersData, lang, isConsiderResize) => ((
  (window.screen.width >= 768 || !isConsiderResize)
  && placeholdersData[`${constants.LANG_PREFIX}${capitalizeFirstLetter(lang)}`])
  ? placeholdersData[`${constants.LANG_PREFIX}${capitalizeFirstLetter(lang)}`]
  : lang);

// Language toggle based on screen width
const updateLanguageTextContent = (domElement, placeholdersData, lang) => {
  domElement.textContent = getLanguageDisplayText(placeholdersData, lang, true);
};

const toggleLangContent = (toggleContainer) => {
  const toggleContent = toggleContainer.querySelector(constants.LANGUAGE_CONTENT_SELECTOR);
  if (!toggleContainer || !toggleContent) return;
  const toggler = toggleContainer.querySelector(constants.LANGUAGE_TOGGLE_SELECTOR);
  const isExpanded = toggleContainer.classList.contains(constants.CONTENT_EXPANDED_ACTIVE);
  toggleContainer.classList.toggle(constants.CONTENT_EXPANDED_ACTIVE);
  toggler.setAttribute(constants.ATTR_ARIA_EXPANDED, !isExpanded);
  toggler.classList.toggle(constants.LANGUAGE_TOGGLE_BORDER_CLASS);
  toggleContent.classList.toggle(constants.CONTENT_EXPANDED);
};

// Show/hide Language Selector content on click
const toggleExpandLanguageSelector = (e) => {
  e.stopPropagation();
  const toggleContainer = e.currentTarget;
  toggleLangContent(toggleContainer);
};

const fetchLanguageSelectorContent = (placeholdersData, metaLangContent, langCode) => {
  const ulElement = ul();
  if (metaLangContent && metaLangContent.split(constants.COMMA_SEPARATOR).length > 0) {
    const langPairs = metaLangContent.split(constants.COMMA_SEPARATOR);
    langPairs.forEach((pair) => {
      const [language, url] = pair.split(constants.PIPE_SEPARATOR).map((part) => part.trim());
      if (langCode === language) return;

      let langAttr = {};
      if (language.length === 2) {
        langAttr = { lang: language };
      }

      const liElement = li(
        a(
          { href: `${url}`, ...langAttr },
          getLanguageDisplayText(placeholdersData, language, false),
        ),
      );
      ulElement.append(liElement);
    });
  }
  return ulElement;
};

// Create and return Language Selector DOM Element
const getLanguageSelector = (placeholdersData, lang) => {
  const metaLangContent = getMetadata(constants.LANGUAGE_SELECTOR_META_NAME);

  const languageToggle = div(
    {
      role: 'button',
      'aria-expanded': 'false',
      'aria-controls': 'language-content',
      tabindex: 0,
      'aria-label': 'Choose language',
    },
  );
  const langSelector = div({ class: constants.LANGUAGE_CONTAINER_CLASS }, languageToggle);

  // Show only Current Language when no meta content authored
  if (!metaLangContent) {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
    languageToggle.classList.add(constants.LANGUAGE_TEXT_CLASS);
  } else {
    const languageMap = fetchLanguageSelectorContent(placeholdersData, metaLangContent, lang);
    const languageSelectorContent = div(
      { class: constants.LANGUAGE_CONTENT_CLASS, id: 'language-content' },
      languageMap,
    );
    languageToggle.classList.add(constants.LANGUAGE_TOGGLE_CLASS);
    langSelector.addEventListener('click', toggleExpandLanguageSelector);
    langSelector.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        toggleExpandLanguageSelector(event);
      }
    });
    langSelector.append(languageSelectorContent);
  }
  // Show Language code in Mobile
  const resizeObserver = new ResizeObserver(() => {
    updateLanguageTextContent(languageToggle, placeholdersData, lang);
  });

  const headerTag = document.querySelector('header');
  if (headerTag) {
    resizeObserver.observe(headerTag);
  } else {
    resizeObserver.observe(document.body);
  }
  return langSelector;
};

// Close Language Selector if clicked outside it's container
document.addEventListener('click', (event) => {
  const languageContainer = event.currentTarget
    .querySelector(constants.LANGUAGE_CONTAINER_CLASS_SELECTOR);
  if (languageContainer
    && languageContainer.classList.contains(constants.CONTENT_EXPANDED_ACTIVE)) {
    toggleLangContent(languageContainer);
  }
});

export default getLanguageSelector;
