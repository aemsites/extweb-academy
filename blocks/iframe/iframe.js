const getDefaultEmbed = (url) => `<div class="iframe-wrapper">
      <iframe src="${url.href}" style="border: 0; width: 100%;" allowfullscreen="" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

/**
 * Attempts to resize the iframe based on its content height.
 * Works for same-origin iframes or cross-origin iframes that send height via postMessage.
 */
const setupDynamicHeight = (iframe, url) => {
  const wrapper = iframe.closest('.iframe-wrapper');
  if (!wrapper) return;

  let heightApplied = false;

  const applyHeight = (height) => {
    if (typeof height === 'number' && height > 0) {
      iframe.style.height = `${height}px`;
      wrapper.style.minHeight = `${height}px`;
      heightApplied = true;
    }
  };

  // Listen for postMessage from cross-origin iframes that support it
  const messageHandler = (event) => {
    // Verify the message is from our iframe's origin
    if (event.origin !== url.origin) return;

    // Parse data if it's a string
    let data = event.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return;
      }
    }

    // Handle height messages (common formats: height or frameHeight)
    if (data && (data.height || data.frameHeight)) {
      applyHeight(data.height || data.frameHeight);
    }
  };

  window.addEventListener('message', messageHandler);

  // Stop listening after iframe has loaded and we've given it time to send resize messages
  iframe.addEventListener('load', () => {
    // For same-origin iframes, try to measure content height directly
    try {
      const contentHeight = iframe.contentWindow.document.body.scrollHeight;
      if (contentHeight > 0) {
        applyHeight(contentHeight);
        // Same-origin worked, remove listener immediately
        window.removeEventListener('message', messageHandler);
      }
    } catch (e) {
      // Cross-origin iframe - keep listening for postMessage
      // Remove listener after a delay to catch late resize messages
      setTimeout(() => {
        if (heightApplied) {
          window.removeEventListener('message', messageHandler);
        }
      }, 3000);
    }
  });
};

const loadEmbed = (block, link, heightMobile, heightDesktop) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const url = new URL(link);
  block.innerHTML = getDefaultEmbed(url);

  const iframe = block.querySelector('iframe');

  // Apply heights using CSS variables for media query support
  if (heightMobile) {
    block.style.setProperty('--iframe-height-mobile', `${heightMobile}px`);
  }
  if (heightDesktop) {
    block.style.setProperty('--iframe-height-desktop', `${heightDesktop}px`);
  }

  // If no explicit heights provided, try to auto-size based on content
  if (!heightMobile && !heightDesktop && iframe) {
    setupDynamicHeight(iframe, url);
  }

  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const props = [...block.children].map((row) => row.firstElementChild);

  // Get URL from first row
  const appUrl = props[0]?.textContent || props[0]?.querySelector('a')?.href || '';

  // Get heights from rows 2 and 3
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
