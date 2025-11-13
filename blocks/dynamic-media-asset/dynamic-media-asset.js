import { img } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const href = block.querySelector('a')?.getAttribute('href') || '';
  const altText = block.querySelector('p[data-aue-prop="dm_alttext"]')?.innerText || '';
  block.innerHTML = '';
  block.append(img({ src: href, alt: altText }));
}
