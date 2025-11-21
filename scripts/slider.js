import {
  loadCSS,
} from './aem.js';

loadCSS(`${window.hlx.codeBasePath}/styles/slider.css`);

// Create navigation button (arrows are styled via CSS using borders)
function arrow(props) {
  const p = document.createElement('p');
  p.className = 'button-container';
  const anchor = document.createElement('button');
  anchor.className = `button ${props}`;
  anchor.title = `${props}`;
  anchor.type = 'button';
  // No image needed - arrow icons are rendered via CSS ::before pseudo-elements
  p.append(anchor);
  return p;
}

export default async function createSlider(block) {
  const nextBtn = 'next';
  const prevBtn = 'prev';
  const wrapper = block.parentElement;

  // Create a container for both buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'carousel-navigation-buttons';
  buttonContainer.append(arrow(`${prevBtn}`));
  buttonContainer.append(arrow(`${nextBtn}`));

  // Append button container to wrapper
  wrapper.append(buttonContainer);

  // Call function after page load
  // Use block-specific selectors instead of document.querySelector to support multiple carousels
  const moveRightBtn = wrapper.querySelector(`.${nextBtn}`);
  const moveLeftBtn = wrapper.querySelector(`.${prevBtn}`);
  const carouselItems = block.querySelector('ul');

  // Safety check: ensure required elements exist
  if (!moveRightBtn || !moveLeftBtn || !carouselItems) {
    return;
  }

  const itemList = [...carouselItems.children];

  // Add drag-to-scroll functionality with momentum
  let isDown = false;
  let startX;
  let scrollLeftStart;
  let hasMoved = false;
  let lastX;
  let lastTime;
  let velocityX = 0;

  // Momentum function
  function applyMomentum(element, velocity) {
    let currentVelocity = velocity * 25; // Scale velocity for effect (higher = faster)
    const deceleration = 0.97; // Deceleration factor (0.97 = 3% reduction per frame)
    const minVelocity = 0.5; // Stop when velocity is very small

    // Temporarily disable scroll snap to allow smooth momentum
    const originalScrollSnapType = element.style.scrollSnapType;
    element.style.scrollSnapType = 'none';

    function animate() {
      if (Math.abs(currentVelocity) > minVelocity) {
        element.scrollLeft -= currentVelocity;
        currentVelocity *= deceleration;
        requestAnimationFrame(animate);
      } else {
        // Re-enable scroll snap after momentum stops
        element.style.scrollSnapType = originalScrollSnapType || '';
      }
    }

    animate();
  }

  // Prevent default drag behavior on images and links
  carouselItems.querySelectorAll('img, a').forEach((element) => {
    element.addEventListener('dragstart', (e) => e.preventDefault());
  });

  carouselItems.addEventListener('mousedown', (e) => {
    // Don't interfere with button clicks or links
    if (e.target.closest('button') || e.target.closest('a')) return;

    isDown = true;
    hasMoved = false;
    carouselItems.classList.add('is-dragging');

    // Disable scroll snap during drag
    carouselItems.style.scrollSnapType = 'none';

    startX = e.pageX - carouselItems.offsetLeft;
    scrollLeftStart = carouselItems.scrollLeft;
    lastX = e.pageX;
    lastTime = Date.now();
    velocityX = 0;
    e.preventDefault();
  });

  // Use document-level listeners to handle mouse events outside carousel
  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    hasMoved = true;

    const currentTime = Date.now();
    const currentX = e.pageX;
    const timeDelta = currentTime - lastTime;

    // Calculate velocity (pixels per millisecond)
    if (timeDelta > 0) {
      velocityX = (currentX - lastX) / timeDelta;
    }

    lastX = currentX;
    lastTime = currentTime;

    const x = e.pageX - carouselItems.offsetLeft;
    const walk = x - startX; // 1:1 movement ratio with mouse
    carouselItems.scrollLeft = scrollLeftStart - walk;
  });

  document.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      carouselItems.classList.remove('is-dragging');

      // Apply momentum if there was significant velocity
      // Lower threshold to trigger more easily
      if (Math.abs(velocityX) > 0.1) {
        applyMomentum(carouselItems, velocityX);
      } else {
        // If no momentum, re-enable scroll snap immediately
        carouselItems.style.scrollSnapType = '';
      }

      // Reset hasMoved after a short delay to allow click prevention
      setTimeout(() => {
        hasMoved = false;
      }, 10);
    }
  });

  // Touch events - minimal interference, just for click prevention
  carouselItems.addEventListener('touchstart', () => {
    hasMoved = false;
  }, { passive: true });

  carouselItems.addEventListener('touchmove', () => {
    hasMoved = true;
  }, { passive: true });

  carouselItems.addEventListener('touchend', () => {
    // Keep hasMoved true briefly to prevent accidental clicks
    setTimeout(() => {
      hasMoved = false;
    }, 150);
  }, { passive: true });

  // Prevent click events when dragging
  carouselItems.addEventListener('click', (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  const observerOptions = {
    rootMargin: '0px',
    threshold: 0.25,
  };

  function moveDirection(itemWidth, option) {
    const targetScrollLeft = option === '+'
      ? carouselItems.scrollLeft + itemWidth
      : carouselItems.scrollLeft - itemWidth;

    // Use smooth scrolling for better UX
    carouselItems.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
  }

  // Button Event Handler
  moveLeftBtn.addEventListener('click', () => {
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
    moveDirection(itemWidth, '-');
  }, true);

  moveRightBtn.addEventListener('click', () => {
    const totalItems = carouselItems.children.length || 1;
    const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
    moveDirection(itemWidth, '+');
  }, true);

  // Check if this is a with-button variant
  const carouselBlock = wrapper.querySelector('.swipe-carousel');
  const isWithButtonVariant = carouselBlock && carouselBlock.classList.contains('with-button');

  // Observer Callback Function
  const callBack = (entries) => {
    const dir = document.documentElement.dir || 'ltr';
    let disableLeftBtn = false;
    let disableRightBtn = false;

    if (dir === 'rtl') {
      if (moveRightBtn) {
        moveRightBtn.style.right = 'auto';
        moveRightBtn.style.left = '0';
      }
      if (moveLeftBtn) {
        moveLeftBtn.style.right = 'auto';
        moveLeftBtn.style.left = '0';
      }
    }

    entries.forEach((entry) => {
      const {
        target,
      } = entry;
      if (entry.intersectionRatio >= 0.25) {
        target.classList.remove('opacity');
        target.classList.add('active');
      } else {
        target.classList.remove('active');
        target.classList.add('opacity');
      }
    });

    // Skip button state management for with-button variant (handled by scroll event)
    if (isWithButtonVariant) {
      return;
    }

    try {
      if (entries[0].target.parentElement.children[0].className === 'active') {
        if (dir === 'rtl') {
          disableLeftBtn = false;
          disableRightBtn = true;
        } else {
          disableLeftBtn = true;
          disableRightBtn = false;
        }
      } else if (entries[0].target.parentElement.children[entries[0].target.parentElement.children.length - 1].className === 'active') {
        if (dir === 'rtl') {
          disableLeftBtn = true;
          disableRightBtn = false;
        } else {
          disableLeftBtn = false;
          disableRightBtn = true;
        }
      }
      moveLeftBtn.disabled = disableLeftBtn;
      moveRightBtn.disabled = disableRightBtn;
    } catch (e) {
      /* error structure was not as expected */
    }
  };

  // Create Observer instance
  const observer = new IntersectionObserver(callBack, observerOptions);

  // Apply observer on each item
  itemList.forEach((item) => {
    observer.observe(item);
  });

  // For with-button variant, use scroll-based button state management
  if (isWithButtonVariant) {
    const updateButtonStates = () => {
      const { scrollLeft } = carouselItems;
      const { scrollWidth } = carouselItems;
      const { clientWidth } = carouselItems;

      // Add small tolerance (10px) to handle sub-pixel rendering issues
      const tolerance = 10;

      // Calculate the maximum scroll position
      const maxScroll = scrollWidth - clientWidth;

      // Disable prev button when at the start
      moveLeftBtn.disabled = scrollLeft <= tolerance;

      // Disable next button when at the end
      moveRightBtn.disabled = scrollLeft >= maxScroll - tolerance;
    };

    // Update button states on scroll
    carouselItems.addEventListener('scroll', updateButtonStates);

    // Initial button state - wait for layout to be calculated
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        updateButtonStates();
      }, 100);
    });

    // Update after window resize
    window.addEventListener('resize', () => {
      // Add delay after resize to ensure layout recalculation
      setTimeout(updateButtonStates, 100);
    });

    // Update when images finish loading (affects carousel width)
    carouselItems.querySelectorAll('img').forEach((img) => {
      if (img.complete) {
        updateButtonStates();
      } else {
        img.addEventListener('load', updateButtonStates, { once: true });
      }
    });
  }
}
