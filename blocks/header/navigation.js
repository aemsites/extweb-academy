import {
  p,
  button,
  div,
  li,
  ul,
  span,
  input,
  a,
} from '../../scripts/dom-helpers.js';
import * as constants from './constants.js';
import { fetchCountriesList } from '../../scripts/utils.js';

// Global Varibale
const isDesktop = window.matchMedia('(min-width: 1024px)');

const filterCountry = (e) => {
  const inputBrowseCountry = e.currentTarget;
  if (!inputBrowseCountry) return;
  const filter = inputBrowseCountry.value.toUpperCase();
  const countryList = inputBrowseCountry.nextElementSibling;
  const para = document.querySelector('.browse-country p');
  para.style.transform = 'rotate(-180deg)';
  para.setAttribute('aria-label', 'close dropdown');
  countryList.style.display = 'block';
  let flag = 0;
  const listItems = countryList.children;
  const listItemsArray = Array.from(listItems);
  listItemsArray.forEach((item) => {
    if (item.textContent.toUpperCase().indexOf(filter) === 0) {
      item.style.display = '';
      flag = 1;
    } else {
      item.style.display = 'none';
    }
  });
  if (!flag) {
    countryList.style.display = 'none';
  }
};

const closesearchbar = (e, navSections) => {
  if (e.type === 'keydown') {
    if (e.key !== 'Enter') {
      return;
    }
  }
  const indicator = navSections.querySelector('.browse-country p');
  const inputtext = navSections.querySelector('.browse-country input');
  const countrylist = navSections.querySelector('.country-list');
  const dropdownButton = document.querySelector('.browse-country p');
  if (e.target === indicator && countrylist.style.display === 'block') {
    countrylist.style.display = 'none';
    dropdownButton.style.transform = 'rotate(0deg)';
    dropdownButton.setAttribute('aria-label', 'open dropdown');
  } else if (e.target === inputtext || e.target === indicator) {
    countrylist.style.display = 'block';
    dropdownButton.style.transform = 'rotate(-180deg)';
    dropdownButton.setAttribute('aria-label', 'close dropdown');
  } else {
    countrylist.style.display = 'none';
    dropdownButton.style.transform = 'rotate(0deg)';
    dropdownButton.setAttribute('aria-label', 'close dropdown');
  }
};
// Create Dropdown category based on Type=dropdown defined in Navigation.json
const createCountryDropDown = (category, countrySearchPlaceholder) => {
  const countryList = ul({ class: constants.COUNTRY_LIST });
  const searchBarWrapper = li(
    {},
    ul(
      {
        class: 'browse-country',
      },
      category.Title,
      div(
        input({
          type: 'text',
          placeholder: countrySearchPlaceholder,
          oninput: (e) => filterCountry(e),
          onfocus: (e) => filterCountry(e),
        }),
        countryList,
      ),
      p({ tabindex: '0', 'aria-label': 'open dropdown' }),
    ),
  );
  fetchCountriesList().then((countries) => {
    countries.forEach((country) => {
      const label = country.Label;
      if (label) {
        const liElement = li({});
        liElement.innerHTML = label;
        countryList.append(liElement);
      }
    });
  });
  return searchBarWrapper;
};

// Create level1 and level2 <li> element with anchor tag
const createListItemWithAnchor = (item) => {
  // Create the main list item
  const listItem = li(
    { class: item.Class || '' },
    a(
      {
        href: item.Link,
        title: item.Title,
        ...(item.NewWindow === 'yes' ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
      },
      item.Title,
      ...(item.NewWindow === 'yes' ? [span({ class: 'lp lp-external-link' })] : [span()]),
    ),
  );

  // If the item has sub-items, recursively create sub-menu
  if (item.items && item.items.length > 0) {
    const subList = ul();
    item.items.forEach((subItem) => {
      subList.appendChild(createListItemWithAnchor(subItem));
    });
    listItem.appendChild(subList);
  }

  return listItem;
};
// Method to Create Submenu categories and its related child links
const createCategoriesAndSubMenu = (
  level0Item,
  submenuId,
  index,
  countrySearchPlaceholder,
) => {
  const submenu = ul({
    id: submenuId,
    class: constants.SUBMENU,
    style:
      isDesktop.matches && index === 0 ? 'display: flex;' : 'display: none;',
  });

  level0Item.categories.forEach((category) => {
    if (category.Type === constants.DROPDOWN) {
      submenu.appendChild(
        createCountryDropDown(category, countrySearchPlaceholder),
      );
    } else {
      const categoryList = ul();
      const categoryItem = li(
        { class: category.Type === constants.FOOTER ? category.Type : '', role: 'link' },
        category.Title,
      );
      category.items.forEach((subItem) => {
        const subMenuItem = createListItemWithAnchor(subItem);
        categoryList.appendChild(subMenuItem);
      });
      categoryItem.appendChild(categoryList);
      submenu.appendChild(categoryItem);
    }
  });
  return submenu;
};

// Method to show SubMenu related to Level0 items.
const showSubMenu = (
  leftColumn,
  rightColumn,
  submenuId,
  submenuTitle,
  submenuLn,
  currentIndex,
) => {
  document.querySelector(
    constants.NAV_MENU_OVERLAY_WITH_SELECTOR,
  ).scrollTop = 0;
  rightColumn.style.display = 'block';
  if (!isDesktop.matches) {
    const sidemenuBackButton = rightColumn.querySelector(
      constants.OVERLAY_BACK_WITH_SELECTOR,
    );
    sidemenuBackButton.style.display = 'block';
    const currentSubMenu = rightColumn.querySelector(
      constants.SUBMENU_MAIN_TITLE_WITH_SELECTOR,
    );
    const submenuredirect = currentSubMenu.querySelector('a');
    submenuredirect.textContent = submenuTitle;
    submenuredirect.href = submenuLn;
    currentSubMenu.style.display = 'flex';
    leftColumn.style.display = 'none';
  }

  const submenus = rightColumn.querySelectorAll(
    constants.SUBMENU_WITH_SELECTOR,
  );
  submenus.forEach((submenu) => {
    if (submenu.id === submenuId) {
      submenu.style.display = 'flex';
      submenu.setAttribute('aria-expanded', 'true');
    } else {
      submenu.style.display = 'none';
      submenu.setAttribute('aria-expanded', 'false');
    }
  });
  const countrylist = rightColumn.querySelector(
    constants.COUNTRY_LIST_WITH_SELECTOR,
  );
  countrylist.style.display = 'none';
  const indicator = rightColumn.querySelector(
    '.browse-country p',
  );
  indicator.style.transform = 'rotate(0deg)';
  indicator.setAttribute('aria-label', 'open dropdown');

  // Update the selected state of the menu items in the left column
  const level0Items = leftColumn.querySelectorAll('li');
  level0Items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add(constants.SELECTED);
      item.setAttribute('aria-expanded', 'true');
    } else {
      item.classList.remove(constants.SELECTED);
      item.setAttribute('aria-expanded', 'false');
    }
  });
};

const closesideMenu = (leftColumn, rightColumn) => {
  const navOverlay = document.querySelector(
    constants.NAV_MENU_OVERLAY_WITH_SELECTOR,
  );
  if (navOverlay) {
    navOverlay.scrollTop = 0;
    leftColumn.style.display = 'flex';
    if (!isDesktop.matches) {
      rightColumn.style.display = 'none';
    } else {
      rightColumn.style.display = 'flex';
    }
    const submenuElements = rightColumn.getElementsByClassName(constants.SUBMENU);
    const submenus = Array.from(submenuElements);
    leftColumn.querySelectorAll('li').forEach((leftColumnItem, index) => {
      leftColumnItem.classList.remove('selected');
      if (index === 0) leftColumnItem.classList.add('selected');
    });
    submenus.forEach((submenu, index) => {
      if (isDesktop.matches && index === 0) {
        submenu.style.display = 'flex';
      } else {
        submenu.style.display = 'none';
      }
    });
    const sidemenuBackButton = rightColumn.querySelector(
      '.nav-menu-overlay-back',
    );
    sidemenuBackButton.style.display = 'none';
    const currentSubMenu = rightColumn.querySelector(
      constants.SUBMENU_MAIN_TITLE_WITH_SELECTOR,
    );
    currentSubMenu.style.display = 'none';
  }
};
const getNavigationMenu = (structuredNav, placeholdersData) => {
  const searchByCountryPlaceholder = placeholdersData
    ? placeholdersData.navMenuSearchByCountryName
    : constants.SEARCH_BY_COUNTRY;
  // Create menu Overlay and divide in two column
  const listMainNavTitle = ul();
  const menuLeftColumn = div(
    { class: constants.NAV_MENU_COLUMN_LEFT },
    listMainNavTitle,
  );

  const menuRightColumn = div(
    { class: constants.NAV_MENU_COLUMN_RIGHT },
    button({
      class: constants.NAV_MENU_OVERLAY_BACK,
      onclick: () => closesideMenu(menuLeftColumn, menuRightColumn),
      'aria-label': 'go back',
    }),
    p({ class: constants.SUBMENU_MAIN_TITLE }, a()),
  );

  const navMenu = div(
    { class: constants.NAV_MENU },
    menuLeftColumn,
    menuRightColumn,
  );
  const menuOverlay = div({ class: constants.NAV_MENU_OVERLAY }, navMenu);

  // Iterate Over structured nav data to create left & right menu navigation.
  structuredNav.forEach((level0Item, index) => {
    const submenuId = `${constants.SUBMENU}_${index}`;
    // create left column menu
    const level0MenuItem = li(
      {
        tabindex: '0',
        'aria-expanded': 'false',
        onkeydown: (e) => (e.code === 'Enter'
          ? showSubMenu(
            menuLeftColumn,
            menuRightColumn,
            submenuId,
            level0Item.title,
            level0Item.link,
            index,
          ) : ''),
        onmouseover: () => (isDesktop.matches
          ? showSubMenu(
            menuLeftColumn,
            menuRightColumn,
            submenuId,
            level0Item.title,
            level0Item.link,
            index,
          )
          : ''),
        onclick: () => (!isDesktop.matches
          ? showSubMenu(
            menuLeftColumn,
            menuRightColumn,
            submenuId,
            level0Item.title,
            level0Item.link,
            index,
          )
          : ''),
      },
      span({ textContent: '' }), // level0MenuItemArrow
      a({ href: level0Item.link }, level0Item.title),
    );
    const isSelected = isDesktop.matches && index === 0 ? constants.SELECTED : '';
    if (isSelected) {
      level0MenuItem.classList.add(isSelected);
      level0MenuItem.setAttribute('aria-expanded', 'true');
    }

    listMainNavTitle.appendChild(level0MenuItem);

    // Create right column submenu
    // Iterate over level0 Items and create associated category list
    const subMenu = createCategoriesAndSubMenu(
      level0Item,
      submenuId,
      index,
      `${searchByCountryPlaceholder}`,
    );
    menuRightColumn.appendChild(subMenu);
  });

  return menuOverlay;
};

const formatNavigationJsonData = (navJson) => {
  const structuredData = [];
  let currentLevel0 = null;
  let currentCategory = null;
  let currentLevel1 = null;
  navJson.forEach((item) => {
    if (item.Type === constants.LEVEL_0) {
      const level0 = {
        title: item.Title,
        link: item.Link,
        categories: [],
      };
      structuredData.push(level0);
      currentLevel0 = level0;
    } else if (
      item.Type === constants.CATEGORY
      || item.Type === constants.FOOTER
      || item.Type === constants.DROPDOWN
    ) {
      const category = {
        ...item,
        items: [],
      };
      currentLevel0.categories.push(category);
      currentCategory = category;
    } else if (item.Type === constants.LEVEL_1) {
      const level1 = {
        ...item,
        items: [],
      };
      currentCategory.items.push(level1);
      currentLevel1 = level1;
    } else if (item.Type === constants.LEVEL_2) {
      currentLevel1.items.push(item);
    }
  });
  return structuredData;
};
export {
  getNavigationMenu, formatNavigationJsonData, closesideMenu, closesearchbar,
};
