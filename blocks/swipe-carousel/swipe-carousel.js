import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import createSlider from '../../scripts/slider.js';

export default function decorate(block) {
  // Ensure we only work with swipe-carousel blocks
  if (!block.classList.contains('swipe-carousel')) {
    return;
  }

  const hasActionButton = block.classList.contains('with-button');

  let i = 0;
  const slider = document.createElement('ul');
  const leftContent = document.createElement('div');
  let h2Element;
  let linkText = '';
  let anchorLink = '';

  [...block.children].forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');

    // Check if row is empty (UE creates empty rows for unused block-level fields)
    // A row is empty if ALL cells have no text AND no child elements (except empty divs)
    const isEmpty = cells.length > 0
      && Array.from(cells).every((cell) => {
        const hasText = cell.textContent.trim().length > 0;
        const hasElements = cell.querySelector('*:not(div:empty)');
        return !hasText && !hasElements;
      });

    // Skip empty rows created by UE for description/linkText/link fields
    if (isEmpty) {
      i += 1;
      return;
    }

    // Detect if this row is plain text (for linkText)
    const isPlainText = cells.length === 1
      && cells[0].textContent.trim()
      && !cells[0].querySelector('picture, img, a, h1, h2, h3, h4, h5, h6');

    // Detect if this row is a link-only row (for link extraction)
    const hasOnlyLink = cells.length === 1
      && cells[0].querySelector('a')
      && !cells[0].querySelector('picture, img, h1, h2, h3, h4, h5, h6');

    // Detect if this row is a card (has 2+ cells with some content)
    const isCard = cells.length >= 2
      && (cells[0].querySelector('picture, img')
        || cells[1].querySelector('h3, h4, p')
        || cells[1].textContent.trim()
        || cells[2]?.textContent.trim());

    // First two non-empty rows are title and description
    if (i === 0 || i === 1) {
      const contentEl = row;
      if (i === 0 && contentEl && contentEl.id) {
        h2Element = contentEl.id;
      }
      leftContent.append(contentEl);
    } else if (isPlainText && hasActionButton && !linkText) {
      // Plain text row after title/description: Extract as linkText
      linkText = cells[0].textContent.trim();
      // Don't process this row further
    } else if (hasOnlyLink && hasActionButton && !anchorLink) {
      // Link row: Extract the link URL
      const linkEl = cells[0].querySelector('a');
      if (linkEl) {
        anchorLink = linkEl.href;
        // If linkText wasn't set, use link text
        if (!linkText) {
          linkText = linkEl.textContent.trim();
        }
      }
      // Don't process this row further
    } else if (isCard) {
      // Card row: cells[0] = image, cells[1] = text, cells[2] = eyebrow (optional)
      const li = document.createElement('li');
      moveInstrumentation(row, li);

      let eyebrow = null;
      if (cells[2]) {
        eyebrow = cells[2].textContent.trim();
      }

      // Check if image cell has actual image content
      const hasImage = cells[0] && cells[0].querySelector('picture, img');

      // Process image cell
      if (hasImage) {
        cells[0].className = 'cards-card-image';
        // Add eyebrow to image container if it exists
        if (eyebrow) {
          const eyebrowEl = document.createElement('span');
          eyebrowEl.className = 'card-eyebrow';
          eyebrowEl.textContent = eyebrow;
          cells[0].insertBefore(eyebrowEl, cells[0].firstChild);
        }
        li.append(cells[0]);
      } else {
        // Create placeholder image cell with eyebrow but no image
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'cards-card-image';
        // Add eyebrow even when no image
        if (eyebrow) {
          const eyebrowEl = document.createElement('span');
          eyebrowEl.className = 'card-eyebrow';
          eyebrowEl.textContent = eyebrow;
          placeholderDiv.appendChild(eyebrowEl);
        }
        li.append(placeholderDiv);
      }

      // Process text cell
      if (cells[1]) {
        cells[1].className = 'cards-card-body';

        // Check if inside tabs section with a slight delay to allow classes to be added
        // Use setTimeout 0 to defer check until after current execution stack
        const allElements = Array.from(cells[1].children);
        const paragraphs = allElements.filter((el) => el.tagName === 'P');
        
        // Defer truncation logic to allow section classes to be fully set
        setTimeout(() => {
          const parentSection = block.closest('.section');
          const isInTabsSection = parentSection && (
            parentSection.classList.contains('tabs-container') ||
            parentSection.classList.contains('tab-carousel-section')
          );
          
          const maxChars = isInTabsSection ? Infinity : 150;

          // Calculate total paragraph text length
          let totalParagraphChars = 0;
          paragraphs.forEach((p) => {
            totalParagraphChars += p.textContent.trim().length;
          });

          // If paragraphs exceed limit, truncate
          if (totalParagraphChars > maxChars) {
          let charCount = 0;
          let truncated = false;

          paragraphs.forEach((p) => {
            if (truncated) {
              // Remove paragraphs after truncation
              p.remove();
            } else {
              const pText = p.textContent.trim();
              const pLength = pText.length;

              if (charCount + pLength <= maxChars) {
                // Keep this paragraph as is
                charCount += pLength;
              } else {
                // Truncate this paragraph
                const remainingChars = maxChars - charCount;
                if (remainingChars > 30) {
                  // We have room for some of this paragraph
                  let text = pText.substring(0, remainingChars);
                  const lastSpace = text.lastIndexOf(' ');
                  if (lastSpace > remainingChars * 0.75) {
                    text = text.substring(0, lastSpace);
                  }
                  p.textContent = `${text}...`;
                } else {
                  // Not enough room, remove this paragraph
                  p.remove();
                }
                truncated = true;
              }
            }
          });
        }
        }, 0); // End setTimeout - defer truncation to allow classes to be set

        li.append(cells[1]);
      }

      slider.append(li);
    }
    i += 1;
  });

  // Create button element from link text and link fields
  let buttonElement = null;
  if (hasActionButton && linkText && anchorLink) {
    const newButton = document.createElement('a');
    newButton.href = anchorLink;
    newButton.className = 'button';
    newButton.textContent = linkText;
    if (h2Element) {
      newButton.setAttribute('aria-describedby', h2Element);
    }

    buttonElement = document.createElement('div');
    buttonElement.className = 'carousel-button';
    const buttonWrapper = document.createElement('p');
    buttonWrapper.className = 'button-container';
    buttonWrapper.appendChild(newButton);
    buttonElement.appendChild(buttonWrapper);
  }

  // Optimise pictures
  slider.querySelectorAll('picture > img').forEach((img) => {
    let { alt } = img;
    if (!alt) {
      alt = 'Default Alt';
    }
    if (!img.src.includes('delivery-')) {
      const optimizedPic = createOptimizedPicture(img.src, alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    }
  });

  /* ---------- extra wrapping only for with-button variant ---------- */
  if (hasActionButton) {
    slider.querySelectorAll('li').forEach((li) => {
      const imgDiv = li.querySelector('.cards-card-image');
      const bodyDiv = li.querySelector('.cards-card-body');
      const oldLink = bodyDiv?.querySelector('a');
      if (!imgDiv || !bodyDiv || !oldLink) return;

      // Create link for the title only
      const titleLink = document.createElement('a');
      titleLink.href = oldLink.href;
      titleLink.title = oldLink.title;
      titleLink.textContent = oldLink.textContent;
      moveInstrumentation(oldLink, titleLink);

      // Find any heading and wrap it with the link
      const heading = bodyDiv.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.textContent = '';
        heading.appendChild(titleLink);
      } else {
        // Fallback: if no heading, wrap the first paragraph
        const firstP = bodyDiv.querySelector('p');
        if (firstP && firstP.contains(oldLink)) {
          firstP.textContent = '';
          firstP.appendChild(titleLink);
        }
      }

      // Remove the old link if it still exists
      if (oldLink.parentNode) {
        oldLink.remove();
      }
    });
  }
  /* ------------------------------------------------------------- */

  leftContent.className = hasActionButton ? 'main-heading' : 'default-content-wrapper';

  // Check if leftContent has any actual content
  const hasLeftContent = leftContent.textContent.trim().length > 0
    || leftContent.querySelector('picture, img, a');

  // Replace original block content
  block.textContent = '';
  if (!hasActionButton && hasLeftContent) {
    block.parentNode.parentNode.prepend(leftContent);
  } else if (hasActionButton && hasLeftContent) {
    block.appendChild(leftContent);
  }
  block.append(slider);
  createSlider(block);

  // Add button element to wrapper AFTER createSlider so navigation buttons exist
  if (hasActionButton && buttonElement) {
    const wrapper = block.parentElement;
    const navigationButtons = wrapper.querySelector('.carousel-navigation-buttons');

    // Create a container for both button and navigation to keep them on the same line
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls';

    // Add button to controls container
    controlsContainer.appendChild(buttonElement);

    // Move navigation buttons into the same container
    if (navigationButtons) {
      controlsContainer.appendChild(navigationButtons);
    }

    // Add the controls container to the wrapper
    wrapper.appendChild(controlsContainer);
  }
  const cardList = block.querySelector('ul');
  cardList.setAttribute('tabindex', '-1');
}
