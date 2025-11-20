const getDefaultEmbed = (url) => `<div class="iframe-wrapper">
      <iframe src="${url.href}" style="border: 0; width: 100%; height: 100%;" allowfullscreen="" frameborder="0"
      scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

const loadEmbed = (block, link, heightMobile, heightDesktop) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const url = new URL(link);
  block.innerHTML = getDefaultEmbed(url);

  // Apply heights using CSS variables for media query support
  if (heightMobile) {
    block.style.setProperty('--iframe-height-mobile', `${heightMobile}px`);
  }
  if (heightDesktop) {
    block.style.setProperty('--iframe-height-desktop', `${heightDesktop}px`);
  }

  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const props = [...block.children].map((row) => row.firstElementChild);
  const appUrl = props[0]?.textContent || '';
  const heightMobileText = props[1]?.textContent?.trim() || '';
  const heightDesktopText = props[2]?.textContent?.trim() || '';

  // Parse heights as integers
  let heightMobile = parseInt(heightMobileText, 10);
  let heightDesktop = parseInt(heightDesktopText, 10);

  // If height is not numeric, set to empty string
  if (Number.isNaN(heightMobile)) heightMobile = '';
  if (Number.isNaN(heightDesktop)) heightDesktop = '';

  block.textContent = '';

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, appUrl, heightMobile, heightDesktop);
    }
  });
  observer.observe(block);
}
