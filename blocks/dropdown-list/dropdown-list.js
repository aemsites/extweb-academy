/* import { moveInstrumentation } from '../../scripts/scripts.js'; */

/**
 * Wraps dropdown lists and GO button in a container for easier styling.
 * Only runs once per section (checks if .finder-row already exists).
 * @param {Element} block The dropdown-list block
 */
function wrapFinderRow(block) {
  const section = block.closest('.section.dropdown-list-container');
  if (!section) return;

  // Skip if already wrapped
  if (section.querySelector('.finder-row')) return;

  // Use requestAnimationFrame to ensure all blocks in section are decorated
  requestAnimationFrame(() => {
    // Double-check (another block might have created it)
    if (section.querySelector('.finder-row')) return;

    // Get title wrapper (first default-content-wrapper with h2)
    const titleWrapper = section.querySelector('.default-content-wrapper:has(h2)');
    // Get all dropdown wrappers
    const dropdownWrappers = [...section.querySelectorAll('.dropdown-list-wrapper')];
    // Get button wrapper (last default-content-wrapper, not the title)
    const buttonWrapper = section.querySelector('.default-content-wrapper:last-child');

    // Only wrap if we have dropdowns and a button (and button is different from title)
    if (dropdownWrappers.length > 0 && buttonWrapper && buttonWrapper !== titleWrapper) {
      // Create the finder row container
      const finderRow = document.createElement('div');
      finderRow.className = 'finder-row';

      // Insert finder-row after title (or at start if no title)
      if (titleWrapper) {
        titleWrapper.after(finderRow);
      } else {
        section.prepend(finderRow);
      }

      // Move dropdowns and button into finder-row
      dropdownWrappers.forEach((wrapper) => finderRow.appendChild(wrapper));
      finderRow.appendChild(buttonWrapper);
    }
  });
}

export default function decorate(block) {
  // Get placeholder from first child (block metadata)
  const blockMetadata = block.querySelector(':scope > div:first-child');
  const firstChild = blockMetadata?.querySelector(':scope > div');
  const placeholderText = firstChild ? firstChild.textContent.trim() : 'Select Option';
  // Get all dropdown items (remaining children after metadata)
  const items = [...block.children].slice(1);

  // If no items, show placeholder message
  if (items.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'dropdown-empty-message';
    emptyMessage.textContent = 'Please add Dropdown Items in the Universal Editor.';
    emptyMessage.style.padding = '1rem';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = '#999';
    block.appendChild(emptyMessage);
    return;
  }

  // Create custom dropdown wrapper
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.className = 'custom-dropdown';

  // Create selected display
  const selectedDiv = document.createElement('div');
  selectedDiv.className = 'selected';

  const selectedSpan = document.createElement('span');
  selectedSpan.className = 'selectedspan';
  selectedSpan.textContent = placeholderText;
  selectedDiv.appendChild(selectedSpan);

  // Create options container
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'options';
  optionsDiv.style.display = 'none';

  // Process each dropdown-item (DON'T move instrumentation, just clone content)
  items.forEach((item) => {
    const optionDiv = item.querySelector(':scope > div');
    if (!optionDiv) return;

    const optionText = optionDiv.textContent.trim();
    if (!optionText) return;

    // Create new option element for display
    const option = document.createElement('div');
    option.className = 'option';
    option.textContent = optionText;

    // DON'T move instrumentation - keep it on the original item
    // This preserves the parent-child relationship in Universal Editor

    // Add click handler
    option.addEventListener('click', () => {
      selectedSpan.textContent = optionText;
      selectedDiv.classList.add('active');
      optionsDiv.style.display = 'none';

      // Store selected value
      dropdownWrapper.dataset.value = optionText.toLowerCase().replace(/\s+/g, '-');

      // Check if this is the first dropdown and add class to container
      const container = block.closest('.dropdown-list-container');
      if (container) {
        const finderRow = container.querySelector('.finder-row');
        const firstDropdownWrapper = finderRow?.querySelector('.dropdown-list-wrapper:first-child');
        if (firstDropdownWrapper && firstDropdownWrapper.contains(block)) {
          container.classList.add('first-dropdown-selected');
        }
      }
    });

    optionsDiv.appendChild(option);
  });

  // Assemble dropdown
  dropdownWrapper.appendChild(selectedDiv);
  dropdownWrapper.appendChild(optionsDiv);

  // Toggle dropdown on click
  selectedDiv.addEventListener('click', (e) => {
    e.stopPropagation();

    // Close all other dropdowns
    document.querySelectorAll('.custom-dropdown .options').forEach((opt) => {
      if (opt !== optionsDiv) {
        opt.style.display = 'none';
      }
    });

    // Toggle this dropdown
    optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'block' : 'none';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    optionsDiv.style.display = 'none';
  });

  // Hide original block structure (but KEEP IT for Universal Editor)
  // Set position absolute and opacity 0 so UE can still interact with it
  [...block.children].forEach((child) => {
    child.style.position = 'absolute';
    child.style.opacity = '0';
    child.style.pointerEvents = 'none';
    child.style.height = '0';
    child.style.overflow = 'hidden';
  });

  // Add custom dropdown for display
  block.appendChild(dropdownWrapper);

  // Wrap dropdowns and button in finder-row (runs once per section)
  wrapFinderRow(block);
}
