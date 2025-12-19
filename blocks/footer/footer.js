import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Switch block handler
 * @param {HTML} ClassName The container
 * @param {HTML} ul The content pass in a parent class
 */
function switchBlock(className, ul) {
  const listName = document.createElement('div');
  listName.className = className;
  listName.appendChild(ul);
  return listName;
}

/**
 * Add <img> for icon, prefixed with codeBasePath and optional prefix.
 * @param {Element} [span] span element with icon classes
 */
function addAttributes(span) {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);
  const iconsvgs = {
    facebook: `<svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.09489 3.21362H9.875V0.173047C9.56847 0.131958 8.51222 0.0385742 7.28239 0.0385742C4.71563 0.0385742 2.95767 1.62236 2.95767 4.5322V7.21045H0.125V10.6096H2.95767V19.1636H6.42926V10.6096H9.14744L9.57955 7.21045H6.42926V4.86838C6.42926 3.88599 6.69886 3.21362 8.09489 3.21362Z" fill="white"/>
</svg>
`,
    whatsapp: `<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1971_10345)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.1024 0.788574C4.72238 0.788574 0.360521 5.15043 0.360521 10.5315C0.360521 12.372 0.871258 14.0933 1.7581 15.5621L0 20.7886L5.39335 19.0616C6.78869 19.8327 8.39435 20.2734 10.1024 20.2734C15.4835 20.2734 19.8453 15.9115 19.8453 10.5304C19.8453 5.14932 15.4835 0.788574 10.1024 0.788574ZM10.1024 18.641C8.45555 18.641 6.92111 18.147 5.64037 17.3002L2.52365 18.2983L3.53622 15.2862C2.56482 13.9487 1.99177 12.3063 1.99177 10.5304C1.99288 6.05841 5.63036 2.41982 10.1024 2.41982C14.5744 2.41982 18.213 6.05841 18.213 10.5304C18.213 15.0024 14.5744 18.641 10.1024 18.641ZM14.6701 12.7447C14.4253 12.6112 13.2258 11.9636 13.001 11.8724C12.7762 11.7811 12.6115 11.7333 12.4369 11.9758C12.2622 12.2184 11.7637 12.7603 11.6134 12.9205C11.4621 13.0808 11.3163 13.0964 11.0715 12.9617C10.8279 12.8282 10.0367 12.5355 9.11761 11.6532C8.40325 10.9666 7.93479 10.1332 7.79904 9.87948C7.66329 9.62467 7.79904 9.49559 7.92701 9.37653C8.04273 9.2686 8.18627 9.09502 8.31646 8.95481C8.44553 8.81461 8.49115 8.71224 8.58017 8.54978C8.66919 8.38733 8.63358 8.24045 8.57572 8.1136C8.51786 7.98675 8.0661 6.74496 7.87805 6.23867C7.69 5.73349 7.47969 5.80805 7.33393 5.80248C7.18927 5.79803 7.02348 5.77021 6.85768 5.76465C6.69189 5.75797 6.42038 5.81027 6.18338 6.05062C5.94637 6.29097 5.28096 6.86847 5.23534 8.09246C5.18972 9.31534 6.0365 10.5315 6.15445 10.7018C6.27239 10.872 7.77123 13.5247 10.2615 14.6152C12.7529 15.7057 12.7651 15.373 13.2224 15.3485C13.6798 15.324 14.7157 14.8021 14.9449 14.2291C15.1741 13.656 15.1919 13.1587 15.1341 13.053C15.0762 12.9472 14.9127 12.8783 14.669 12.7447H14.6701Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1971_10345">
<rect width="19.8453" height="20" fill="white" transform="translate(0 0.788574)"/>
</clipPath>
</defs>
</svg>
`,
    twitter: `<svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1971_10349)">
<path d="M8.73532 7.14009L14.1989 0.788574H12.9036L8.15925 6.3035L4.37011 0.788574H0L5.73019 9.12762L0 15.7886H1.29525L6.30504 9.96421L10.307 15.7886H14.6771L8.7341 7.14009H8.73532ZM6.96184 9.201L6.38087 8.37052L1.76125 1.76338H3.75L7.47798 7.09606L8.05895 7.92654L12.9048 14.8578H10.9161L6.96184 9.20222V9.201Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1971_10349">
<rect width="14.6771" height="15" fill="white" transform="translate(0 0.788574)"/>
</clipPath>
</defs>
</svg>
`,
    linkedin: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.1482 15.7853H12.0114V10.915C12.0114 9.75487 11.9918 8.25779 10.3809 8.25779C8.77004 8.25779 8.49557 9.5248 8.49557 10.8307V15.7853H5.35874V5.76913H8.3714V7.1366H8.41388C9.02817 6.09642 10.1685 5.47425 11.3841 5.51962C14.5634 5.51962 15.1482 7.5935 15.1482 10.2928V15.7886V15.7853ZM1.82001 4.39843C0.816881 4.39843 0 3.59156 0 2.5935C0 1.59544 0.813614 0.788574 1.82001 0.788574C2.82641 0.788574 3.64002 1.59544 3.64002 2.5935C3.64002 3.59156 2.82641 4.39843 1.82001 4.39843ZM3.38842 15.7853H0.248332V5.76913H3.38842V15.7886V15.7853Z" fill="white"/>
</svg>
`,
    youtube: `<svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.6044 2.8445C18.3858 2.03645 17.7403 1.39717 16.923 1.18237C15.4395 0.788574 9.5 0.788574 9.5 0.788574C9.5 0.788574 3.56055 0.788574 2.07699 1.18237C1.25973 1.39717 0.614247 2.03645 0.395616 2.8445C0 4.30718 0 7.3655 0 7.3655C0 7.3655 0 10.4238 0.395616 11.8865C0.614247 12.6945 1.25973 13.3338 2.07699 13.5486C3.56055 13.9424 9.5 13.9424 9.5 13.9424C9.5 13.9424 15.4395 13.9424 16.923 13.5486C17.7403 13.3338 18.3858 12.6945 18.6044 11.8865C19 10.4238 19 7.3655 19 7.3655C19 7.3655 19 4.30718 18.6044 2.8445ZM7.55836 10.1425V4.58846L12.5244 7.3655L7.55836 10.1425Z" fill="white"/>
</svg>
`,
    flickr: `<svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.42829 0.788574C1.98252 0.788574 0 2.7711 0 5.21687C0 7.66264 1.98252 9.64516 4.42829 9.64516C6.87406 9.64516 8.85659 7.66264 8.85659 5.21687C8.85659 2.7711 6.87406 0.788574 4.42829 0.788574ZM15.5711 0.788574C13.1254 0.788574 11.1428 2.7711 11.1428 5.21687C11.1428 7.66264 13.1254 9.64516 15.5711 9.64516C18.0169 9.64516 19.9994 7.66264 19.9994 5.21687C19.9994 2.7711 18.0169 0.788574 15.5711 0.788574Z" fill="white"/>
</svg>
`,
    instagram: `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0096 0.788574H4.99045C2.23886 0.788574 0 3.00504 0 5.72912V13.1441C0 15.8685 2.23886 18.0846 4.99045 18.0846H12.0096C14.7615 18.0846 17 15.8682 17 13.1441V5.72912C17.0004 3.00504 14.7615 0.788574 12.0096 0.788574ZM15.7205 13.1441C15.7205 15.1698 14.0557 16.818 12.0096 16.818H4.99045C2.94427 16.818 1.27945 15.1698 1.27945 13.1441V5.72912C1.27945 3.7034 2.94427 2.05523 4.99045 2.05523H12.0096C14.0557 2.05523 15.7205 3.7034 15.7205 5.72912V13.1441ZM8.52284 4.81783C7.31419 4.78278 6.16319 5.23077 5.28151 6.07834C4.37721 6.94795 3.85864 8.16331 3.85864 9.41262C3.85864 11.9463 5.94095 14.0078 8.50021 14.0078C9.73588 14.0078 10.8964 13.5291 11.7671 12.6595C12.6265 11.8014 13.1144 10.6544 13.1414 9.4296C13.1695 8.14994 12.7721 7.03755 11.9912 6.21238C11.1675 5.34169 9.96797 4.85938 8.52284 4.81783ZM11.5777 9.39564C11.5397 11.1135 10.188 12.4593 8.49985 12.4593C6.81167 12.4593 5.42238 11.0926 5.42238 9.41262C5.42238 8.57914 5.76797 7.76879 6.3712 7.18929C6.92626 6.65567 7.64153 6.36448 8.39293 6.36448C8.42102 6.36448 8.44912 6.36484 8.47722 6.36556C9.49684 6.39483 10.3172 6.70806 10.8496 7.27094C11.3449 7.79444 11.5967 8.52929 11.5777 9.39564ZM14.3362 4.68778C14.3362 5.27958 13.8516 5.75934 13.2538 5.75934C12.656 5.75934 12.1714 5.27958 12.1714 4.68778C12.1714 4.09597 12.656 3.61621 13.2538 3.61621C13.8516 3.61621 14.3362 4.09597 14.3362 4.68778Z" fill="white"/>
</svg>
`,
  };
  span.innerHTML += iconsvgs[iconName];
  // Icon link analytics
  const iconLink = span.parentElement;
  iconLink.dataset.customlink = 'sm:footer';
  iconLink.ariaLabel = `${iconName} icon`;
  iconLink.dataset.text = iconName;
}

/**
 * Images / Icons Handler
 * @param {Element} [element] Element containing icons
 */
function addElementProperties(element) {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    addAttributes(span);
    span.removeChild(span.firstElementChild);
  });
}

/**
 * Add anchor tag & properties for logo.
 * @param {Element} [element] Element containing icons
 */
function addAnchorTag(element) {
  const anchorLink = document.createElement('a');
  const logoImage = element.querySelector('img');
  anchorLink.href = '/en/home';
  anchorLink.title = logoImage.alt;
  anchorLink.appendChild(element);
  return anchorLink;
}

/**
 * HTML handler
 * @param {HTML} ClassName The container
 * @param {HTML} ul The content pass in a parent class
 */
function htmlParser(htmlObj, ul, prepend = '') {
  [...htmlObj].forEach((contentValue) => {
    addElementProperties(contentValue);

    const li = document.createElement('li');
    if (contentValue.tagName === 'PICTURE') {
      const pictureTagHandler = addAnchorTag(contentValue);
      li.appendChild(pictureTagHandler);
    } else {
      li.appendChild(contentValue);
    }

    if (prepend) {
      if (contentValue.textContent.trim()) {
        ul.prepend(li);
      }
    } else {
      ul.append(li);
    }
  });
}

export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const section = document.createElement('section');
  if (footerPath === '/footer-home') {
    section.className = 'default-content-wrapper section bg-primary-blue-90 footer-home';
  } else {
    section.className = 'default-content-wrapper section bg-primary-blue-90';
  }

  const rows = fragment.firstElementChild.querySelectorAll('.columns-wrapper');
  const classes = ['ft-social', 'ft-main', 'ft-legal'];
  [...rows].forEach((rowValue, rowIndex) => {
    rowValue.className = classes[rowIndex];
    const columns = rowValue.querySelectorAll('.columns > div > div');
    [...columns].forEach((columnValue) => {
      // Handling "a" tag.
      const ul = document.createElement('ul');
      const anchorTag = columnValue.querySelectorAll('div > p > a');
      htmlParser(anchorTag, ul);

      // Handling "picture" tag.
      const pictureTag = columnValue.querySelectorAll('div > picture');
      htmlParser(pictureTag, ul);

      // Handline "p" tag.
      const pTag = columnValue.querySelectorAll('div > p');
      htmlParser(pTag, ul, 'prepend');

      switch (rowValue.className) {
        case 'ft-social':
          rowValue.append(switchBlock('ft-social-list', ul));
          break;
        case 'ft-main':
          rowValue.append(switchBlock('ft-main-item', ul));
          break;
        case 'ft-legal':
          rowValue.append(switchBlock('ft-legal-list', ul));
          break;
        default:
      }

      // Subscribe newsletter analytics
      if (rowValue.className === 'ft-main') {
        const subscribeLink = ul.querySelector('a[href*="newsletter"]');
        if (subscribeLink) {
          subscribeLink.dataset.form = 'world bank group newsletters::newsletter';
        }
      }
    });
    rowValue.removeChild(rowValue.firstElementChild);
    if ( !(footerPath === '/footer-home' && rowValue.className === 'ft-main')) {
      section.append(rowValue);
    }
  });
  block.append(section);
}
