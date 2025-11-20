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
  // Read all rows from the block
  const rows = [...block.children];

  // Extract values from each row
  const getRowValue = (row) => {
    if (!row) return '';
    // Check for link first
    const link = row.querySelector('a');
    if (link) return link.href;
    // Then try paragraph
    const p = row.querySelector('p');
    if (p) return p.textContent.trim();
    // Fallback to text content
    return row.textContent.trim();
  };

  // Get iframe URL from first row
  const appUrl = getRowValue(rows[0]);

  // Get heights from rows 2 and 3 if they exist
  const heightMobileText = getRowValue(rows[1]);
  const heightDesktopText = getRowValue(rows[2]);

  // Parse heights as integers
  let heightMobile = parseInt(heightMobileText, 10);
  let heightDesktop = parseInt(heightDesktopText, 10);

  // If height is not numeric, set to empty string
  if (Number.isNaN(heightMobile)) heightMobile = '';
  if (Number.isNaN(heightDesktop)) heightDesktop = '';

  console.log('Iframe properties:', {
    appUrl,
    heightMobile,
    heightDesktop,
    totalRows: rows.length,
  });

  block.textContent = '';

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, appUrl, heightMobile, heightDesktop);
    }
  });
  observer.observe(block);
}
