import { fetchSearch, LANGUAGE_ROOT } from '../../scripts/scripts.js';
import {
  getLanguage,
} from '../../scripts/utils.js';  
import {
  ol, li, a, span, nav
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const results = await fetchSearch();
  const regex = '^/(.*?)/?$';
  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  const navtab = nav ({ class: 'breadcrumb-navtab' });
  const list = ol({ class: 'breadcrumb', itemtype: 'https://schema.org/BreadcrumbList', itemscope: '' });
  navtab.setAttribute('aria-label','Breadcrumb');
  const { origin } = window.location;
  let pagePath = '';
  let metaContent = 1;
  pathSegments.forEach((page) => {
    pagePath += page;
    const crumb = li({
      class: 'crumb', itemprop: 'itemListElement', itemscope: '', itemtype: 'https://schema.org/ListItem',
    });
    // This condition is for homepage path
    if (!pagePath) {
      const href = `${origin}/${getLanguage()}/home`;
      const homeSvg = `${window.hlx.codeBasePath}/icons/home.svg`;
      // TODO:localize the title and alt
      const homeLink = `<a itemprop='item' href='${href}' title='Home'><img itemprop='image'
        src='${homeSvg}' alt='Home'></img></a><meta itemprop='position' content='${metaContent}'/>`;
      crumb.innerHTML = homeLink;
      const pipelineSymbol = span({ class: 'breadcrumb-separator' });
      crumb.append(pipelineSymbol);
      list.append(crumb);
    } else {
      const pageObj = results.filter((item) => item.path === pagePath);
      if (pageObj && pageObj.length === 1) {
        metaContent += 1;
        const pageInfo = pageObj[0];
        let label = pageInfo.bcTitle || pageInfo.navTitle || pageInfo.title;
        if (label) {
          label = label.replace(/&amp;/g, "&");
        }
        if (pageInfo.path === window.location.pathname) {
          const labelElement = span({ itemprop: 'name', class: 'current-page' }, label);
          const anchor = a({
            href: ''            
          }, labelElement);
          anchor.setAttribute('aria-current', 'page');
          crumb.append(anchor);
        } else {
          
          var displayPath = pagePath;
          var displayLabel = label;
          if(pagePath.endsWith('/region')) {
            
            displayPath = displayPath.replace('/region', '/where-we-work');
            displayLabel = getPageLabel(displayPath, results);
          } 
          else if(pagePath.endsWith('/country')) {
            
            displayPath = displayPath.replace('/country', '/where-we-work');
            displayLabel = getPageLabel(displayPath, results);
          }              
          const labelElement = span({ itemprop: 'name' }, displayLabel);
          const anchor = a({
            class: 'breadcrumb',
            href: origin + displayPath,
            title: displayLabel,
            itemprop: 'item',
          }, labelElement);
          crumb.append(anchor);
        }
        const meta = document.createElement('meta');
        // Using setAttribute because meta.itemprop is not working to set itemprop attribute.
        meta.setAttribute('itemprop', 'position');
        meta.setAttribute('content', metaContent);
        crumb.append(meta);
        const pipelineSymbol = span({
          class: 'breadcrumb-separator',
        });
        crumb.append(pipelineSymbol);
        list.append(crumb);
      }
    }
    navtab.append(list);
    pagePath = `${pagePath}/`;
  });
  block.innerHTML = navtab.outerHTML;
}
function getPageLabel(pagePath, results) {
  const pageObj = results.find(item => item.path === pagePath);
  if (pageObj) {
    return pageObj.bcTitle || pageObj.navTitle || pageObj.title || '';
  }
  return '';
}