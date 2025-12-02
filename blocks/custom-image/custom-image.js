/* https://developer.adobe.com/uix/docs/extension-manager/extension-developed-by-adobe/configurable-asset-picker/ */

import { decorateDMImagesWithRendition } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const pictures = [...block.querySelectorAll('picture')];
  const [
    imgD, imgT, imgM, alt,
    imageRatio,
    modifiers,
    disableSmartCrop,
    aspectRatioDiv,
    objectPosDiv,
    loadingDiv,
  ] = [...block.children];
  const loadingValue = loadingDiv?.textContent.trim() || 'eager';

  const p = alt.querySelector('p');
  let altText = 'Add alt text for all images';
  if (p) {
    altText = p.textContent.trim();
  }
  // Extract image URLs from <img src="">
  // eslint-disable-next-line no-unused-vars
  const links = pictures
    .map((pic) => {
      const img = pic.querySelector('img');
      return img?.src;
    })
    .filter(Boolean);
  const paragraph = document.createElement('div');
  paragraph.className = 'auto-image-container-v1';

  const getText = (el, defaultValue = '') => {
    if (el instanceof Element) {
      // eslint-disable-next-line no-shadow
      const p = el.querySelector('p');
      return p ? p.textContent.trim() : defaultValue;
    }
    return defaultValue;
  };

  const isDisable = getText(disableSmartCrop, 'false');

  if (isDisable === 'false' && imgD && imgD.innerHTML.trim() !== '') {
    await decorateDMImagesWithRendition(
      imgD,
      imageRatio,
      modifiers,
      disableSmartCrop,
      '',
      alt,
      aspectRatioDiv,
      objectPosDiv,
      loadingValue,
    );
    paragraph.appendChild(imgD);
    imgT?.remove();
    imgM?.remove();
  } else {
    // eslint-disable-next-line no-inner-declarations
    function getImageSrc(wrapper) {
      if (!wrapper) return null;

      // Case 1: <a><img></a>
      const link = wrapper.querySelector('a');
      if (link && link.href) {
        return link.href;
      }

      // Case 2: <picture><img></picture>
      const img = wrapper.querySelector('img');
      if (img && img.src) {
        return img.src;
      }

      return null;
    }

    // Get sources from wrappers
    const desktopSrc = getImageSrc(imgD);
    let tabletSrc = getImageSrc(imgT);
    let mobileSrc = getImageSrc(imgM);

    if (mobileSrc === null || mobileSrc === undefined) {
      mobileSrc = tabletSrc;
    }
    if (desktopSrc === null || desktopSrc === undefined || desktopSrc === '') {
      return;
    }
    if (!tabletSrc) tabletSrc = desktopSrc;
    if (!mobileSrc) mobileSrc = tabletSrc;

    const desktop = desktopSrc;
    const tablet = tabletSrc;
    const mobile = mobileSrc;

    const picture = document.createElement('picture');
    picture.innerHTML = `
         <source type="image/webp" srcset="${desktop}" media="(min-width: 1200px)" width="1456" height="516">
         <source type="image/webp" srcset="${tablet}" media="(min-width: 768px)" width="672" height="400">
         <source type="image/jpeg" srcset="${mobile}" media="(min-width: 320px)" width="334" height="272">
         <img loading="eager" alt="${altText}" src="${desktop}" width="1456" height="516">
       `;
    paragraph.appendChild(picture);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';
  wrapper.appendChild(paragraph);

  block.innerHTML = '';
  block.appendChild(wrapper);
}
