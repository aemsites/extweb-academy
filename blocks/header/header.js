import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// swapna-search: DOM helper functions imported for creating search elements
// swapna-DOM-helper: Added button and span for hamburger menu creation
import {
  div,
  img,
  button,
  span,
} from '../../scripts/dom-helpers.js';

// swapna-mobile: Media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 1500px)');

// Swapna-mobile: Media query for showing 3-dots menu (below 1500px)
const showThreeDotsMenu = window.matchMedia('(max-width: 1499px)');

// swapna-search: Variables for search functionality to store placeholders and search configuration
// eslint-disable-next-line prefer-const
let listOfAllPlaceholdersData = {};

// swapna-search-close-on-focus: Variable to store search container reference
let searchContainer;

// Home page search dropdown - tracks if dropdown is currently open
let isHomeSearchOpen = false;

/**
 * Closes the home page search dropdown and removes it from DOM
 */
function closeHomeSearchDropdown() {
  const dropdown = document.querySelector('.home-search-dropdown');
  if (!dropdown) return;

  dropdown.classList.remove('open');
  dropdown.setAttribute('aria-hidden', 'true');

  const searchIcon = document.querySelector('.header-home .lp-search');
  if (searchIcon) {
    searchIcon.classList.remove('active');
  }

  setTimeout(() => {
    dropdown.remove();
  }, 300);

  isHomeSearchOpen = false;
}

/**
 * Handles click outside to close dropdown
 */
function handleClickOutside(e) {
  const dropdown = document.querySelector('.home-search-dropdown');
  if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.lp-search')) {
    closeHomeSearchDropdown();
    document.removeEventListener('click', handleClickOutside);
  }
}

/**
 * Opens the home page search dropdown
 */
function openHomeSearchDropdown() {
  if (isHomeSearchOpen) return;

  const headerHome = document.querySelector('.header-home');
  if (!headerHome) return;

  const dropdown = document.createElement('div');
  dropdown.className = 'home-search-dropdown';
  dropdown.setAttribute('aria-hidden', 'true');

  const container = document.createElement('div');
  container.className = 'home-search-container';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'home-search-input-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'home-search-input';
  input.placeholder = 'Search Academy';
  input.setAttribute('aria-label', 'Search Academy');

  const searchBtn = document.createElement('button');
  searchBtn.className = 'home-search-btn lp lp-search';
  searchBtn.setAttribute('aria-label', 'Submit search');
  searchBtn.type = 'button';

  const performSearch = () => {
    const query = input.value.trim();
    if (query) {
      const searchUrl = listOfAllPlaceholdersData.searchRedirectUrl
        || 'https://academy.worldbank.org/en/search?q=';
      window.location.href = searchUrl + encodeURIComponent(query);
    }
  };

  searchBtn.addEventListener('click', performSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
    if (e.key === 'Escape') closeHomeSearchDropdown();
  });

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(searchBtn);
  container.appendChild(inputWrapper);
  dropdown.appendChild(container);

  headerHome.appendChild(dropdown);
  isHomeSearchOpen = true;

  requestAnimationFrame(() => {
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');
    input.focus();
  });

  const searchIcon = document.querySelector('.header-home .lp-search');
  if (searchIcon) {
    searchIcon.classList.add('active');
  }

  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 10);
}

/**
 * Toggles the home page search dropdown
 */
function toggleHomeSearchDropdown() {
  if (isHomeSearchOpen) {
    closeHomeSearchDropdown();
  } else {
    openHomeSearchDropdown();
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const hamButton = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  hamButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

// swapna-search: start - createInlineSearchBox function creates an inline search box
// in the nav-tools section
/**
 * Creates an inline search box in the nav-tools section
 * @param {Element} navTools - The nav-tools element
 */
function createInlineSearchBox(navTools) {
  const contentWrapper = navTools.querySelector('.default-content-wrapper');
  if (!contentWrapper) return; // Exit early if no content wrapper found
  const searchIconParagraph = contentWrapper.querySelector('p');
  if (!searchIconParagraph) return; // Exit early if no search icon paragraph found

  // swapna-search: Create wrapper for search box
  const searchWrapper = div({ class: 'inline-search-wrapper' });

  // swapna-search: Create search input with placeholder text and attributes
  const searchInputBox = document.createElement('input');
  Object.assign(searchInputBox, {
    type: 'search',
    id: 'inline-search-input',
    name: 'search',
    placeholder: listOfAllPlaceholdersData.searchVariable || 'Search Academy',
    value: '',
    autocomplete: 'off',
    className: 'inline-search-input',
  });

  // swapna-search: Handle Enter key press in search input to redirect to search results academy

  searchInputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const inputValue = searchInputBox.value.trim();
      if (inputValue) {
        const url = (listOfAllPlaceholdersData.searchRedirectUrl || 'https://academy.worldbank.org/en/search?q=people') + encodeURIComponent(inputValue);
        window.location.href = url;
      }
    }
  });

  // swapna-search: Create search icon button with accessibility attributes
  const searchIconButton = div({
    class: 'inline-search-icon',
    role: 'button',
    tabindex: '0',
    'aria-label': 'Search',
  });
  const searchIconImg = img({ class: 'search-icon-img' });
  searchIconImg.src = `${window.hlx.codeBasePath}/icons/search.svg`;
  searchIconImg.alt = 'Search';

  // swapna-search: performSearch function handles search action when icon is clicked
  const performSearch = () => {
    const inputValue = searchInputBox.value.trim();
    if (inputValue) {
      const url = (listOfAllPlaceholdersData.searchRedirectUrl || 'https://www.worldbank.org/en/search?q=') + encodeURIComponent(inputValue);
      window.location.href = url;
    } else {
      searchInputBox.focus();
    }
  };

  // swapna-search: Add click event listener to search icon button
  searchIconButton.addEventListener('click', performSearch);

  // swapna-search: Add keyboard event listener for accessibility (Enter/Space key)
  searchIconButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      performSearch();
    }
  });

  searchIconButton.appendChild(searchIconImg);
  searchWrapper.append(searchInputBox, searchIconButton);

  // swapna-search: Insert search wrapper before existing search icon and hide old icon
  if (searchIconParagraph) {
    contentWrapper.insertBefore(searchWrapper, searchIconParagraph);
    // swapna-search: Hide the old search icon
    searchIconParagraph.style.display = 'none';
  } else {
    contentWrapper.insertBefore(searchWrapper, contentWrapper.firstElementChild);
  }
}

// swapna-search: end - createInlineSearchBox function

// swapna-search: start - setAccessibilityAttrForSearchIcon function sets
// accessibility attributes for the search icon
/**
 * Sets accessibility attributes for the search icon
 * @param {Element} contentWrapper - The content wrapper element
 */
function setAccessibilityAttrForSearchIcon(contentWrapper) {
  if (!contentWrapper) return; // Exit early if no content wrapper found
  // swapna-search: Find the icon element (not the input)
  const iconTag = [...contentWrapper.children].find((child) => child.classList.contains('icon') || child.querySelector('.icon'));
  if (iconTag) {
    const iconSpan = iconTag.querySelector('span');
    if (iconSpan) {
      // swapna-search: Set role, aria-label and tabindex for keyboard accessibility
      iconSpan.setAttribute('role', 'button');
      iconSpan.setAttribute('aria-label', 'Perform a search query');
      iconSpan.setAttribute('tabindex', 0);
    }
  }
}

// swapna-search: end - setAccessibilityAttrForSearchIcon function

// swapna-search-close-on-focus: start - closeSearchBox function closes the search box
/**
 * Closes the search box and resets the UI state
 */
function closeSearchBox() {
  const navWrapper = document.querySelector('.nav-wrapper');
  const headerWrapper = document.querySelector('.header-wrapper');
  const searchContainerElement = headerWrapper?.querySelector('.search-container');
  const cancelContainer = navWrapper?.querySelector('.cancel-container');
  const overlay = document.querySelector('.overlay');
  const searchImage = document.querySelector('.icon-search');

  if (searchContainerElement) searchContainerElement.style.display = 'none';
  if (cancelContainer) cancelContainer.style.display = 'none';
  if (searchImage) searchImage.style.display = 'flex';
  if (overlay) overlay.style.display = 'none';
  document.body.classList.remove('no-scroll');
}
// swapna-search-close-on-focus: end - closeSearchBox function

// swapna-search-close-on-focus: start - closeSearchOnFocusOut function handles closing
// search box when focus moves outside
/**
 * Closes the search box when focus moves outside the search area
 * @param {Event} e - The event object
 * @param {Element} navTools - The nav-tools element
 */
function closeSearchOnFocusOut(e, navTools) {
  if (searchContainer && searchContainer.style.display !== 'none') {
    const cancelContainer = navTools.querySelector('.cancel-container');
    const searchImage = navTools.querySelector('.icon-search');
    const isClickInside = searchContainer.contains(e.target)
      || cancelContainer?.contains(e.target)
      || searchImage?.contains(e.target);
    if (!isClickInside) {
      closeSearchBox();
    }
  }
}
// swapna-search-close-on-focus: end - closeSearchOnFocusOut function

// Swapna-mobile: start - toggleThreeDotsMenu function to show/hide nav-tools and nav-links
/**
 * Toggles the 3-dots menu to show/hide nav-tools and nav-links
 * @param {Element} nav - The nav element
 * @param {*} forceExpanded - Optional param to force menu expand behavior when not null
 */
function toggleThreeDotsMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const threeDotsButton = nav.querySelector('.nav-three-dots button');

  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  if (threeDotsButton) {
    threeDotsButton.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  }

  // Swapna-mobile: Prevent body scroll when menu is open
  if (!expanded && showThreeDotsMenu.matches) {
    document.body.style.overflowY = 'hidden';
  } else {
    document.body.style.overflowY = '';
  }
}
// Swapna-mobile: end - toggleThreeDotsMenu function

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

  // Add home-specific class IMMEDIATELY (before loading fragment) to prevent flash
  const isHomeNav = navPath.includes('nav-home');
  if (isHomeNav) {
    block.classList.add('header-home');
  }

  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // Add nav-home class for CSS targeting
  if (isHomeNav) {
    nav.classList.add('nav-home');
  }

  while (fragment.firstElementChild) { nav.append(fragment.firstElementChild); }

  // Process home nav structure - add search icon and mobile support
  if (isHomeNav) {
    const columnsBlock = nav.querySelector('.columns');
    if (columnsBlock) {
      const columns = columnsBlock.querySelectorAll(':scope > div > div');

      // Process third column (navigation links)
      if (columns.length >= 3) {
        const thirdColumn = columns[2];
        thirdColumn.classList.add('home-nav-links');

        // Add font-based search icon to the navigation (for desktop)
        const searchIcon = document.createElement('span');
        searchIcon.className = 'lp lp-search home-search-icon';
        searchIcon.setAttribute('role', 'button');
        searchIcon.setAttribute('tabindex', '0');
        searchIcon.setAttribute('aria-label', 'Search');

        searchIcon.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleHomeSearchDropdown();
        });

        searchIcon.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleHomeSearchDropdown();
          }
        });

        thirdColumn.appendChild(searchIcon);

        // Hide the original SVG search icon
        const svgIcon = thirdColumn.querySelector('.icon-search');
        if (svgIcon) {
          svgIcon.style.display = 'none';
        }
      }
    }

    // Create mobile search trigger (for mobile/tablet views)
    const mobileSearchTrigger = document.createElement('div');
    mobileSearchTrigger.className = 'mobile-search-trigger';

    const mobileSearchIcon = document.createElement('span');
    mobileSearchIcon.className = 'lp lp-search';
    mobileSearchIcon.setAttribute('role', 'button');
    mobileSearchIcon.setAttribute('tabindex', '0');
    mobileSearchIcon.setAttribute('aria-label', 'Search');

    mobileSearchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleHomeSearchDropdown();
    });

    mobileSearchIcon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleHomeSearchDropdown();
      }
    });

    mobileSearchTrigger.appendChild(mobileSearchIcon);
    nav.appendChild(mobileSearchTrigger);

    // Create mobile menu panel for home navigation
    const mobileMenuPanel = document.createElement('div');
    mobileMenuPanel.className = 'mobile-menu-panel';

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-menu-close';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.innerHTML = '<span class="close-icon">×</span>';
    closeButton.addEventListener('click', () => {
      nav.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = '';
    });
    mobileMenuPanel.appendChild(closeButton);

    // Clone the entire home-nav-links (third column) into the mobile panel
    // This allows CSS to handle all styling via selectors without complex JS
    const homeColumnsBlock = nav.querySelector('.columns');
    const homeThirdColumn = homeColumnsBlock?.querySelectorAll(':scope > div > div')[2];

    if (homeThirdColumn) {
      const mobileNavLinks = homeThirdColumn.cloneNode(true);
      mobileNavLinks.classList.add('mobile-nav-links');
      mobileMenuPanel.appendChild(mobileNavLinks);
    }

    nav.appendChild(mobileMenuPanel);
  }

  const classes = ['brand', 'sections', 'tools', 'links'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  } else {
    // swapna-logo-click: start - Make logo clickable and redirect to World Bank homepage
    // If there's no button, wrap the logo image/picture with a link
    const brandContent = navBrand.querySelector('.default-content-wrapper');
    if (brandContent) {
      const picture = brandContent.querySelector('picture');
      const imgElement = brandContent.querySelector('img');

      if (picture || imgElement) {
        // swapna-logo-click: Create anchor element for logo with World Bank homepage URL
        const logoLink = document.createElement('a');
        logoLink.href = 'https://www.worldbank.org/ext/en/home';
        logoLink.setAttribute('aria-label', 'World Bank Home');

        // swapna-logo-click: Wrap the picture element (or img if no picture) with the link
        const elementToWrap = picture || imgElement;
        elementToWrap.parentNode.insertBefore(logoLink, elementToWrap);
        logoLink.appendChild(elementToWrap);
      }
    }
    // swapna-logo-click: end - Make logo clickable and redirect to World Bank homepage
  }

  // swapna-nav-link: start - Handle nav-links section (4th section)
  const navLinks = nav.querySelector('.nav-links');
  if (navLinks) {
    navLinks.querySelectorAll('.button').forEach((link) => {
      link.className = '';
      link.closest('.button-container').className = '';
    });
  }
  // swapna-nav-link: end - Handle nav-links section

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // swapna-search: start - Setup search functionality in nav-tools section
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const contentWrapper = nav.querySelector('.nav-tools > div[class = "default-content-wrapper"]');

    // swapna-search: Add inline search box to the nav-tools section
    createInlineSearchBox(navTools);

    // swapna-search: Set accessibility attributes for search icon
    setAccessibilityAttrForSearchIcon(contentWrapper);

    // swapna-search-close-on-focus: start - Close search container on focus out
    // Add click event listener to close search box when clicking outside
    document.addEventListener('click', (e) => {
      closeSearchOnFocusOut(e, navTools);
    });

    // Add keydown event listener to close search box on Tab key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const headerWrapper = document.querySelector('.header-wrapper');
        searchContainer = headerWrapper?.querySelector('.search-container');
        if (searchContainer && searchContainer.style.display !== 'none' && !searchContainer.contains(e.target)) {
          closeSearchBox();
        }
      }
    });
    // swapna-search-close-on-focus: end - Close search container on focus out
  }
  // swapna-search: end - Setup search functionality in nav-tools section

  // swapna-DOM-helper: start - Create hamburger menu using DOM helper functions
  // instead of innerHTML for better performance and security
  const hamburgerClickHandler = () => {
    if (isHomeNav) {
      // For home nav, toggle the mobile menu panel
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      document.body.style.overflowY = expanded ? '' : 'hidden';
    } else if (navSections) {
      toggleMenu(nav, navSections);
    }
  };

  const hamburger = div(
    { class: 'nav-hamburger', onclick: hamburgerClickHandler },
    button(
      {
        type: 'button',
        'aria-controls': 'nav',
        'aria-label': 'Open navigation',
      },
      span({ class: 'nav-hamburger-icon' }),
    ),
  );

  // Load megamenu content fragment and add it to hamburger
  const megamenuFragment = await loadFragment('/fragments/megamenu');
  const megamenuOverlay = div(
    { class: 'megamenu-overlay' },
    div(
      { class: 'megamenu-content' },
      button(
        {
          type: 'button',
          class: 'megamenu-close',
          'aria-label': 'Close menu',
        },
        span({ class: 'megamenu-close-icon' }),
      ),
      megamenuFragment,
    ),
  );
  hamburger.appendChild(megamenuOverlay);

  // Toggle megamenu overlay on hamburger click
  const hamButton = hamburger.querySelector('button:not(.megamenu-close)');
  hamButton.addEventListener('click', () => {
    megamenuOverlay.classList.toggle('active');
    document.body.style.overflow = megamenuOverlay.classList.contains('active') ? 'hidden' : '';
  });

  // Close megamenu on close button click
  const megamenuCloseButton = megamenuOverlay.querySelector('.megamenu-close');
  megamenuCloseButton.addEventListener('click', (e) => {
    e.stopPropagation();
    megamenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // swapna-DOM-helper: end - Create hamburger menu using DOM helper functions

  // Swapna-mobile: start - Create 3-dots menu button for mobile/tablet (< 1500px)
  const threeDotsMenu = div(
    { class: 'nav-three-dots' },
    button(
      {
        type: 'button',
        'aria-controls': 'nav',
        'aria-label': 'Open menu',
        onclick: () => { toggleThreeDotsMenu(nav); },
      },
      div(
        { class: 'nav-three-dots-icon' },
        span(),
        span(),
        span(),
      ),
    ),
  );

  // Swapna-mobile: Insert 3-dots menu after nav-sections (before nav-tools)
  const navToolsElement = nav.querySelector('.nav-tools');
  if (navToolsElement) {
    nav.insertBefore(threeDotsMenu, navToolsElement);
  }
  // Swapna-mobile: end - Create 3-dots menu button

  // Swapna-mobile: start - Create close button for 3-dots menu
  const closeButton = div(
    { class: 'nav-close-button' },
    button(
      {
        type: 'button',
        'aria-controls': 'nav',
        'aria-label': 'Close menu',
        onclick: () => { toggleThreeDotsMenu(nav); },
      },
      div({ class: 'nav-close-button-icon' }),
    ),
  );

  // Swapna-mobile: Append close button to nav
  nav.appendChild(closeButton);
  // Swapna-mobile: end - Create close button for 3-dots menu

  // swapna-desktop-hamburger: start - Keep aria-expanded='false' on desktop page load
  // Only call toggleMenu for mobile to prevent setting aria-expanded='true' on desktop
  // This ensures hamburger icon shows 3 lines (not X) on desktop when page loads
  if (!isDesktop.matches && navSections) {
    toggleMenu(nav, navSections, false);
  }
  // swapna-desktop-hamburger: end - Keep aria-expanded='false' on desktop page load

  // prevent mobile nav behavior on window resize
  if (navSections) {
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));
  }

  // Swapna-mobile: start - Handle 3-dots menu behavior on window resize
  showThreeDotsMenu.addEventListener('change', () => {
    if (!showThreeDotsMenu.matches) {
      // Swapna-mobile: When going to desktop (>= 1500px), close the 3-dots menu
      nav.setAttribute('aria-expanded', 'false');
      document.body.style.overflowY = '';
    }
  });
  // Swapna-mobile: end - Handle 3-dots menu behavior on window resize

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
