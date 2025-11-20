const getDefaultEmbed = (url) => `
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position:absolute;" allowfullscreen="" frameborder="0" 
      scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      title="Content from ${url.hostname}" loading="lazy" height="100%" width="100%">
    </iframe>`;

const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const url = new URL(link);
  block.innerHTML = getDefaultEmbed(url);
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const props = [...block.children].map((row) => row.firstElementChild);
  const appUrl = props[0].textContent;

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, appUrl);
    }
  });
  observer.observe(block);
}
