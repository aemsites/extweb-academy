function initHeroScrollTrigger() {
  const trigger = document.querySelector('.section.hero-video-section > .default-content-wrapper p:nth-child(4)');
  const target = document.getElementById('sticky-section');

  if (!trigger || !target) return;

  // Create hotspot overlay
  const hotspot = document.createElement('div');
  hotspot.className = 'hero-scroll-hotspot';
  document.body.appendChild(hotspot);

  // Position hotspot over the trigger button
  // Account for 8px bounce animation range
  const bounceDistance = 8;

  function updateHotspotPosition() {
    const rect = trigger.getBoundingClientRect();
    hotspot.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height + bounceDistance}px;
      z-index: 9999;
      cursor: pointer;
      border-radius: 32px;
      background: transparent;
    `;
  }

  updateHotspotPosition();
  window.addEventListener('scroll', updateHotspotPosition);
  window.addEventListener('resize', updateHotspotPosition);

  // Click handler
  hotspot.addEventListener('click', () => {
    target.scrollIntoView({ behavior: 'smooth' });
  });

  // Hide hotspot when scrolled past the hero section
  const heroSection = document.querySelector('.section.hero-video-section');
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        hotspot.style.display = entry.isIntersecting ? 'block' : 'none';
      });
    }, { threshold: 0 });
    observer.observe(heroSection);
  }
}

initHeroScrollTrigger();
