import { scriptEnabled } from '../../scripts/utils.js';

const getDefaultEmbed = (url) => `<div class="embed-video">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position:absolute;" allowfullscreen="" frameborder="0" 
      scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      title="Content from ${url.hostname}" loading="lazy" height="100%" width="100%">
    </iframe>
  </div>`;

const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const url = new URL(link);
  block.innerHTML = getDefaultEmbed(url);
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {

  const [videoDiv,youtubeDiv,embedDiv] = [...block.children];
  const pElement = videoDiv.querySelector('div > div > p');
  const videoType = pElement ? pElement.textContent.trim() : null;
  if(videoType == 'you-tube')
  {
      if (!scriptEnabled()) {
        block.innerHTML = 'Video rendering is disabled';
        return;
      }
      const placeholder = block.querySelector('picture');
      const link = block.querySelector('a').href;
      block.textContent = '';

      if (placeholder) {
        const wrapper = document.createElement('div');
        wrapper.className = 'embed-placeholder';
        wrapper.innerHTML = '<div class="embed-placeholder-play"><button title="Play"></button></div>';
        wrapper.prepend(placeholder);
        wrapper.addEventListener('click', () => {
          loadEmbed(block, link);
        });
        block.append(wrapper);
      } else {
        const observer = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            loadEmbed(block, link);
          }
        });
        observer.observe(block);
      }
  }
  if(videoType == 'embed-code')
  {
      const embedEl = embedDiv.querySelector('div > div > p');
      const embedHTML = embedEl ? embedEl.innerText.trim() : null;
      // Step 1: Decode HTML entities (&lt; and &gt;)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = embedHTML;
      // Step 2: Create a container and inject iframe
      block.innerText = '';
      block.appendChild(tempDiv);
      // Step 3: Append to body (or any other element)
  }
}
