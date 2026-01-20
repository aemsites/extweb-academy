function initHeroScrollTrigger() {
  const trigger = document.querySelector('.section.hero-video-section > .default-content-wrapper p:nth-child(4)');
  const target = document.getElementById('sticky-section');

  if (trigger && target) {
    trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', () => {
      target.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

initHeroScrollTrigger();
