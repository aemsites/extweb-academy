import { createOptimizedPicture } from '../../scripts/aem.js';
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
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
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

  //run this if the data-card-img-link="true" is set:
  if (block.getAttribute('data-card-img-link') === 'true') {
    [...ul.children].forEach(wrapImageWithLink);
  }

  block.textContent = '';
  block.append(ul);
}

