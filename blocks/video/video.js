import { scriptEnabled } from '../../scripts/utils.js';

const getDefaultEmbed = (url) => {
  // Add autoplay parameter to YouTube URLs
  const embedUrl = new URL(url.href);
  if (embedUrl.hostname.includes('youtube.com') || embedUrl.hostname.includes('youtu.be')) {
    embedUrl.searchParams.set('autoplay', '1');
  }

  return `<iframe src="${embedUrl.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position:absolute;" allowfullscreen="" frameborder="0" 
    scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    title="Content from ${url.hostname}" loading="lazy" height="100%" width="100%">
  </iframe>`;
};

const loadEmbed = (block, link, wrapper) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const url = new URL(link);
  const embedHTML = getDefaultEmbed(url);

  // If wrapper exists, replace its content to maintain dimensions
  if (wrapper) {
    // Replace wrapper content and update classes to maintain same container
    wrapper.innerHTML = embedHTML;
    wrapper.classList.remove('embed-placeholder');
    wrapper.classList.add('embed-video');
  } else {
    // Fallback: replace entire block content
    block.innerHTML = `<div class="embed-video">${embedHTML}</div>`;
  }

  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const [videoDiv, youtubeDiv, embedDiv] = [...block.children];
  const pElement = videoDiv.querySelector('div > div > p');
  const videoType = pElement ? pElement.textContent.trim() : null;
  if (videoType === 'you-tube') {
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
        loadEmbed(block, link, wrapper);
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
  if (videoType === 'embed-code') {
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
