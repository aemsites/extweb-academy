
import { createOptimizedPicture } from '../../scripts/aem.js';
import { div as divEl } from '../../scripts/dom-helpers.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const wrapImageWithLink = (li) => {
  const imgDiv = li.querySelector('.cards-card-image');
  const h3link = li.querySelector('.cards-card-body h3:first-child a');

  if (!imgDiv || !h3link) return;

  const link = document.createElement('a');
  link.href = h3link.href;

  const picture = imgDiv.querySelector('picture');
  if (picture) {
    link.appendChild(picture);
    imgDiv.prepend(link);
  }
};

export default function decorate(block) {
  // check if the block has profile-summary as its classname
  const isProfileSummary = (block.classList.contains('profile-summary'));

  /* change to ul, li */
  const ul = isProfileSummary ? divEl() : document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = isProfileSummary ? divEl() : document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  [...ul.children].forEach(wrapImageWithLink);

  block.textContent = '';
  block.append(ul);
}
