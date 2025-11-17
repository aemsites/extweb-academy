import { getMetadata, toClassName, fetchPlaceholders } from '../../scripts/aem.js';
import {
  a, button, div, span, i,
} from '../../scripts/dom-helpers.js';
import {
  getLanguage, fetchData, scriptEnabled, getFormattedDates, getTaxonomy,
} from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';

const langCode = getLanguage();
const upiId = getMetadata('upi');
const globalProperties = await fetchPlaceholders();
const langMap = globalProperties.langMap || '[{"code": "en", "name": "English"}]';

function getLanguageName(code) {
  const languages = JSON.parse(langMap);
  const language = languages.find((lang) => lang.code === code);
  return language ? language.name : 'English';
}

const langName = getLanguageName(langCode);

async function getTabUrl(type) {
  try {
    const tabUrl = `${type}Url`;
    const rawUrl = globalProperties[`${tabUrl}`];
    return rawUrl.replace('{langCode}', langCode).replace('{upiId}', upiId).replace('{langName}', langName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching tab URL for type: ${type}`, error);
    return '';
  }
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getActualValue(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    if ('cdata!' in value) {
      // Case: "conttype": { "cdata!": "Communiqués de presse" }
      return value['cdata!'];
    }

    if ('0' in value && value['0'] && 'cdata!' in value['0']) {
      return value['0']['cdata!'];
    }
  }

  return '';
}

function createListElement(masterType, link, heading, date) {
  return div(
    { class: 'tab-li-element' },
    div({ class: 'tab-li-element-type' }, masterType),
    a(
      { href: link, rel: 'noopener noreferrer', target: '_blank' },
      div({ class: 'tab-li-element-heading' }, heading),
    ),
    div({ class: 'tab-li-element-date' }, date),
  );
}

async function updateDatesTranslation(data, type, prop) {
  if (data && Object.prototype.hasOwnProperty.call(data, type)) {
    const dateArray = [];
    const value = data[type];
    Object.keys(value).forEach((key) => {
      const item = value[key];
      if (Object.keys(item).length > 0) {
        dateArray.push(item[prop] ? item[prop] : '');
      }
    });

    const dateData = await getFormattedDates(dateArray, langCode);
    if (dateData && Object.prototype.hasOwnProperty.call(dateData, 'dateArray')) {
      const dateArr = dateData.dateArray;
      if (dateArr.length > 0) {
        let index = 0;
        Object.keys(value).forEach((key) => {
          const item = value[key];
          if (Object.keys(item).length > 0) {
            const translatedDate = dateArr[index];
            if (translatedDate) {
              item[prop] = translatedDate;
            }
          }
          index += 1;
        });
      }
    }
  }

  return data;
}

function removeShowMoreButton(tabPanel) {
  const buttonContainer = tabPanel.querySelector('.show-more-container');
  if (buttonContainer) {
    tabPanel.removeChild(buttonContainer);
  }
}

async function showMoreButton(tabPanel, loadMoreFn) {
  const buttonContainer = div({ class: 'show-more-container' });
  const languagePlaceholders = await fetchPlaceholders();
  const buttonEl = button({ class: 'show-more-button' }, languagePlaceholders.loadMore || 'Load More');
  buttonEl.addEventListener('click', () => {
    loadMoreFn();
  });

  buttonContainer.appendChild(buttonEl);
  tabPanel.appendChild(buttonContainer);
}

function populateTab(data, tabPanel, elementType, createItemFn, disableLoadMore, displayItems) {
  if (data && elementType === 'documents'
    && Object.prototype.hasOwnProperty.call(data[elementType], 'facets')) {
    delete data[elementType].facets; // Remove facets if present
  }
  const items = data?.value || Object.values(data[elementType] || {});

  let displayedItemsCount = 0;
  let itemsPerPage = displayItems || 5;

  let tabLiWrapper = null;
  const is2ColumnView = tabPanel.classList.contains('two-column-view');
  if (is2ColumnView) {
    itemsPerPage = displayItems || 4;
    tabLiWrapper = div({ class: 'tab-li-wrapper' });
    tabPanel.appendChild(tabLiWrapper);
  }

  async function loadMoreItems() {
    removeShowMoreButton(tabPanel);
    const remainingItems = items.slice(displayedItemsCount, displayedItemsCount + itemsPerPage);
    remainingItems.forEach((item) => {
      if (Object.keys(item).length !== 0) {
        const liElement = createItemFn(item);
        if (liElement) {
          if (tabLiWrapper) {
            tabLiWrapper.appendChild(liElement);
          } else {
            tabPanel.appendChild(liElement);
          }
        }
      }
    });
    displayedItemsCount += remainingItems.length;
    await showMoreButton(tabPanel, loadMoreItems);
    if (displayedItemsCount >= items.length) {
      removeShowMoreButton(tabPanel);
    }
  }

  if (items.length > 0) {
    if (disableLoadMore) {
      items.forEach((item, index) => {
        if (Object.keys(item).length !== 0 && (index < itemsPerPage)) {
          const liElement = createItemFn(item);
          if (liElement) {
            if (tabLiWrapper) {
              tabLiWrapper.appendChild(liElement);
            } else {
              tabPanel.appendChild(liElement);
            }
          }
        }
      });
    } else {
      loadMoreItems();
    }
  }
}

function populateBlogTab(data, tabPanel, disableLoadMore, displayItems, type) {
  populateTab(data, tabPanel, 'blogs', (blog) => {
    const heading = blog.title;
    const liLink = blog.pagePublishPath;
    const date = blog.blogDate;
    if (heading || liLink || date) {
      return createListElement(type, liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

function populatePublicationTab(data, tabPanel, disableLoadMore, displayItems) {
  populateTab(data, tabPanel, 'documents', (doc) => {
    const masterType = doc.docty;
    const heading = doc.display_title;
    const liLink = doc.url;
    const date = doc.docdt;
    if (heading || liLink || date) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

function populateProjectTab(data, tabPanel, disableLoadMore, displayItems) {
  populateTab(data, tabPanel, 'projects', (project) => {
    const heading = project.project_name;
    const liLink = project.url;
    const date = project.boardapprovaldate;
    if (heading || liLink || date) {
      return createListElement('Project', liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

function populateAllTab(data, tabPanel, disableLoadMore, displayItems) {
  populateTab(data, tabPanel, 'everything', (item) => {
    const heading = item.title;
    const masterType = item.displayconttype_exact !== undefined
      ? item.displayconttype_exact
      : item.docty_exact;
    const liLink = item.url;
    const date = item.master_date;
    if (item.contenttype !== 'People' && (heading || liLink || date)) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

function populateNewsTab(data, tabPanel, disableLoadMore, displayItems) {
  populateTab(data, tabPanel, 'documents', (doc) => {
    const masterType = getActualValue(doc.conttype);
    const heading = getActualValue(doc.title);
    const liLink = doc.url;
    const date = doc.lnchdt;
    if (heading || liLink || date) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

function populateEventsTab(data, tabPanel, disableLoadMore, displayItems) {
  populateTab(data, tabPanel, 'SearchResults', (doc) => {
    const masterType = doc.contentType;
    const heading = doc.title;
    const liLink = doc.publishPath;
    const date = doc.eventStartDate;
    if (heading || liLink || date) {
      return createListElement(masterType, liLink, heading, date);
    }
    return '';
  }, disableLoadMore, displayItems);
}

async function fetchDataForTab(type, url, postDataString) {
  if (type === 'blogs') {
    const postData = {
      search: '*',
      filter: `(bloggers/any(blogger: blogger/upi eq '${upiId}') and (language eq '${langName}'))`,
      top: 50,
      skip: 0,
      orderby: 'blogDate desc',
      count: true,
    };
    const headers = {
      'ocp-apim-subscription-key': 'a02440fa123c4740a83ed288591eafe4',
    };
    return fetchData(url, 'POST', headers, postDataString || postData);
  }

  if (type === 'events') {
    const postData = {
      query: '',
      filter: `(contentType: ANY("Event") OR contentType: ANY("Event Series")) AND language: ANY("${langName}")`,
      pageSize: 20,
      offset: 0,
      orderby: 'eventStartDate desc',
      count: true,
      summarization: false,
      siteName: 'ibrdevents',
      facetSpecs: [],

    };
    const headers = {};
    return fetchData(url, 'POST', headers, postDataString || postData);
  }

  return fetchData(url);
}

function showSpinner(tabPanel) {
  const spinnerContainer = div({ class: 'spinner-container' }, div({ class: 'spinner' }));
  tabPanel.appendChild(spinnerContainer);
}

function removeSpinner(tabPanel) {
  const spinner = tabPanel.querySelector('.spinner-container');
  if (spinner) tabPanel.removeChild(spinner);
}

async function decorateTab(tabPanel, type) {
  if (!scriptEnabled()) return;
  let body;
  const url = tabPanel.children[2]?.textContent.trim() || await getTabUrl(type);
  if ((type === 'blogs' || type === 'events') && tabPanel.children[4]?.textContent) {
    body = JSON.parse(tabPanel.children[4]?.textContent.trim());
  }

  let displayItems = tabPanel.children[7]?.textContent.trim();
  if (displayItems) {
    displayItems = parseInt(tabPanel.children[7]?.textContent.trim(), 10);
  }

  let disableLoadMore = false;
  if (tabPanel.children[7]?.textContent) {
    disableLoadMore = tabPanel.children[8].textContent.trim() === 'true';
  }

  const seeMoreButtonLabel = tabPanel.children[9]?.textContent.trim();
  let seeMoreButtonLink = '';
  if (tabPanel.children[10] && tabPanel.children[10].querySelector('a')) {
    seeMoreButtonLink = tabPanel.children[10].querySelector('a').getAttribute('href');
  }

  const tabReference = tabPanel;
  tabPanel.innerHTML = '';
  showSpinner(tabReference);
  const data = await fetchDataForTab(type, url, body);
  if (data) {
    if (type === 'blogs') {
      const typ = await getTaxonomy('world-bank:content-type/blog', 'content-type');
      populateBlogTab(await updateDatesTranslation(data, 'value', 'blogDate'), tabPanel, disableLoadMore, displayItems, typ);
    } else if (type === 'publication') {
      populatePublicationTab(await updateDatesTranslation(data, 'documents', 'docdt'), tabPanel, disableLoadMore, displayItems);
    } else if (type === 'project') {
      populateProjectTab(await updateDatesTranslation(data, 'projects', 'boardapprovaldate'), tabPanel, disableLoadMore, displayItems);
    } else if (type === 'news') {
      populateNewsTab(await updateDatesTranslation(data, 'documents', 'lnchdt'), tabPanel, disableLoadMore, displayItems);
    } else if (type === 'events') {
      const eventsData = {};
      Object.keys(data).forEach((key) => {
        const item = data[key];
        if (key === 'SearchResults') {
          const documents = {};
          data[key].forEach((doc) => {
            if (Object.prototype.hasOwnProperty.call(doc, 'document')) {
              const { document } = doc;
              if (document
                && Object.prototype.hasOwnProperty.call(document, 'id')
                && Object.prototype.hasOwnProperty.call(document, 'structData')) {
                documents[document.id] = document.structData;
              }
            }
          });
          eventsData[key] = documents;
        } else {
          eventsData[key] = item;
        }
      });
      populateEventsTab(
        await updateDatesTranslation(eventsData, 'SearchResults', 'eventStartDate'),
        tabPanel,
        disableLoadMore,
        displayItems,
      );
    } else {
      populateAllTab(await updateDatesTranslation(data, 'everything', 'master_date'), tabPanel, disableLoadMore, displayItems);
    }

    if (disableLoadMore && seeMoreButtonLabel && seeMoreButtonLink) {
      const showMoreContainer = div({ class: 'show-more-container' });
      const anchor = a({
        class: 'show-more-anchor button',
        href: seeMoreButtonLink,
        title: seeMoreButtonLabel,
      }, seeMoreButtonLabel);
      showMoreContainer.append(anchor);
      tabPanel.appendChild(showMoreContainer);
    }
  } else {
    // eslint-disable-next-line no-console
    console.error('No data available for tab type:', type);
  }

  removeSpinner(tabPanel);
}

function getScrollLeftRTL(element) {
  const isRTL = document.documentElement.dir === 'rtl';

  if (!isRTL) return Math.ceil(element.scrollLeft);

  const { scrollLeft } = element;
  const maxScroll = element.scrollWidth - element.clientWidth;

  return Math.abs(scrollLeft) === maxScroll ? 0 : maxScroll + scrollLeft;
}

export default async function decorate(block) {
  const tabContainer = div({ class: 'tab-navigation' });
  const tabList = div({ class: 'tabs-list', role: 'tablist' });

  const rightButton = button({
    class: 'right-btn',
    'aria-label': 'Scroll tabs right',
    type: 'button',
    tabIndex: 0,
  }, i({ class: 'lp lp-chevron-right' }));
  const leftButton = button({
    class: 'left-btn',
    'aria-label': 'Scroll tabs left',
    type: 'button',
    tabIndex: 0,
  }, i({ class: 'lp lp-chevron-left' }));
  const dir = document.documentElement.dir || 'ltr';
  const offset = 150;

  const iconVisibility = () => {
    const scrollLeftValue = getScrollLeftRTL(tabList);
    const scrollableWidth = tabList.scrollWidth - tabList.clientWidth;

    if (dir === 'rtl') {
      leftButton.style.display = scrollableWidth > 0 && scrollLeftValue < scrollableWidth ? 'block' : 'none';
      rightButton.style.display = scrollLeftValue > 1 ? 'block' : 'none';
    } else {
      leftButton.style.display = scrollLeftValue > 0 ? 'block' : 'none';
      rightButton.style.display = scrollableWidth > 0 && scrollLeftValue < scrollableWidth ? 'block' : 'none';
    }
  };

  rightButton.addEventListener('click', () => {
    tabList.scrollLeft += dir === 'rtl' ? -offset : offset;
    iconVisibility();
  });

  leftButton.addEventListener('click', () => {
    tabList.scrollLeft += dir === 'rtl' ? offset : -offset;
    iconVisibility();
  });

  // Decorate tabs and tab panels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, index) => {
    const id = toClassName(tab.textContent);
    const tabpanel = block.children[index];
    const tabType = tabpanel.children[1].textContent;
    const extraClass = tabpanel.children[6] ? ` ${tabpanel.children[6].textContent}` : '';
    tabpanel.className = `tabs-panel${extraClass}`;
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!index);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.setAttribute('type', tabType);
    tabpanel.setAttribute('data-loaded', false);

    const tabButton = button({
      class: 'tab-btn',
      id: `tab-${id}`,
      type: 'button',
      'aria-controls': `tabpanel-${id}`,
      'aria-selected': !index,
      'data-customlink': 'tb:body content',
      'data-wbgtabidtabheader': `${id}`,
      role: 'tab',
    }, span(tab.textContent.trim()));

    tabButton.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tabList.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      tabButton.setAttribute('aria-selected', true);

      if (tabType !== 'manual' && tabType !== 'text-image' && tabpanel.getAttribute('data-loaded') === 'false') {
        decorateTab(tabpanel, tabType);
        tabpanel.setAttribute('data-loaded', true);
      }
    });

    tabButton.addEventListener('keydown', (event) => {
      const tabBtn = Array.from(tabList.querySelectorAll('button[class^="tab-"]'));
      const currentIndex = tabBtn.indexOf(tabButton);

      if (event.key === 'ArrowLeft') {
        const previousTab = currentIndex === 0
          ? tabBtn[tabBtn.length - 1]
          : tabBtn[currentIndex - 1];
        previousTab.focus();
      } else if (event.key === 'ArrowRight') {
        const nextTab = currentIndex === tabBtn.length - 1
          ? tabBtn[0]
          : tabBtn[currentIndex + 1];
        nextTab.focus();
      }
    });

    if (index === 0 && tabType !== 'manual' && tabType !== 'text-image') {
      decorateTab(tabpanel, tabType);
      tabpanel.setAttribute('data-loaded', true);
    }
    tabList.append(tabButton);
  });

  tabContainer.appendChild(leftButton);
  tabContainer.appendChild(tabList);
  tabContainer.appendChild(rightButton);

  setTimeout(iconVisibility, 0);
  const resizeObserver = new ResizeObserver(() => {
    iconVisibility();
  });
  resizeObserver.observe(tabList);

  block.querySelectorAll('[type="manual"] a').forEach(async (link) => {
    const currentPath = window.location.pathname.replace(/\.html$/, '');
    const path = link ? link.getAttribute('href') : '';

    if (path === '') return;
    const ablosutePath = path.replace('.html', '');
    const tabPanel = link.closest('[role=tabpanel]');
    if (path === currentPath) {
      tabPanel.innerHTML = '';
      return;
    }
    const fragment = await loadFragment(ablosutePath);
    // decorate footer DOM
    const content = div({}, fragment);
    tabPanel.innerHTML = '';
    tabPanel.append(content);
  });

  function getISOFormattedDate(dateString) {
    const timeString = 'T00:00:00Z';
    let day = '';
    let month = '';
    let year = '';

    if (/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(dateString) || /^[A-Za-z]+ \d{1,2},\d{4}$/.test(dateString)) {
      const dateSplit = dateString.split(',');
      const monthSplit = dateSplit[0].split(' ');

      [, day] = monthSplit;
      [month] = monthSplit;
      year = dateSplit[1].trim();

      if (months.indexOf(month) !== -1) {
        month = (months.indexOf(month) + 1).toString().padStart(2, '0');
      }

      if (day) {
        day = day.toString().padStart(2, '0');
      }
      return [year, month, day].join('-') + timeString;
    }
    return dateString;
  }

  // eslint-disable-next-line no-unused-vars
  async function getTranslatedDatesManual(items) {
    const dateArray = [];
    items.forEach((item) => {
      const cardDate = item.querySelector('.mini-card-date p');
      if (cardDate) {
        dateArray.push(getISOFormattedDate(cardDate.textContent));
      }
    });

    if (dateArray.length > 0) {
      const dateData = await getFormattedDates(dateArray, langCode);
      if (dateData && Object.prototype.hasOwnProperty.call(dateData, 'dateArray')) {
        const dateArr = dateData.dateArray;
        if (dateArr.length > 0) {
          items.forEach((item, index) => {
            const cardDate = item.querySelector('.mini-card-date p');
            const translatedDate = dateArr[index];
            if (cardDate && translatedDate) {
              cardDate.innerText = translatedDate;
            }
          });
        }
      }
    }
  }

  window.setTimeout(() => {
    block.querySelectorAll('[type="manual"] .mini-cards-container').forEach(async (cardContainer) => {
      const cardContainerParent = cardContainer.parentNode;
      const items = cardContainer.querySelectorAll('.mini-card');
      let onLoad = true;
      let displayedItemsCount = 0;
      const itemsPerPage = 5;

      async function loadMoreItemsManual() {
        if (onLoad) {
          items.forEach((item, index) => {
            if (index >= itemsPerPage) {
              item.classList.add('hide');
            }
          });

          onLoad = false;
          await showMoreButton(cardContainerParent, loadMoreItemsManual);
        } else {
          const remainingItems = Array.prototype.slice.call(
            items,
            displayedItemsCount,
            displayedItemsCount + itemsPerPage,
          );
          remainingItems.forEach((item) => {
            item.classList.remove('hide');
          });

          if ((displayedItemsCount + itemsPerPage) >= items.length) {
            removeShowMoreButton(cardContainerParent);
          }
        }
        displayedItemsCount += itemsPerPage;
      }

      if (items.length > itemsPerPage) {
        loadMoreItemsManual();
      }

      // getTranslatedDatesManual(items);
    });
  }, 2000);

  block.prepend(tabContainer);
}
