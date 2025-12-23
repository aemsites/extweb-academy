import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Get placeholder from first child (block metadata)
  const blockMetadata = block.querySelector(':scope > div:first-child');
  const firstChild = blockMetadata?.querySelector(':scope > div');
  const placeholderText = firstChild ? firstChild.textContent.trim() : 'Select Option';
  // Get all dropdown items (remaining children after metadata)
  const items = [...block.children].slice(1);

  // If no items, show placeholder message in a paragraph
  if (items.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'dropdown-empty-message';
    emptyMessage.textContent = 'Please add Dropdown Items in the Universal Editor.';
    block.textContent = '';
    block.appendChild(emptyMessage);
    return;
  }

  // Create custom dropdown wrapper
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.className = 'custom-dropdown';

  // Preserve block metadata instrumentation on wrapper
  if (blockMetadata) {
    moveInstrumentation(blockMetadata, dropdownWrapper);
  }

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

  // Process each dropdown-item (preserve instrumentation)
  items.forEach((item) => {
    const optionDiv = item.querySelector(':scope > div');
    if (!optionDiv) return;

    const optionText = optionDiv.textContent.trim();
    if (!optionText) return;

    // Create new option element
    const option = document.createElement('div');
    option.className = 'option';
    option.textContent = optionText;

    // Preserve Universal Editor instrumentation - only move item, NOT its child
    // This keeps Option Text as a child of Dropdown Item in the UE tree
    moveInstrumentation(item, option);

    // Add click handler
    option.addEventListener('click', () => {
      selectedSpan.textContent = optionText;
      selectedDiv.classList.add('active');
      optionsDiv.style.display = 'none';

      // Store selected value
      dropdownWrapper.dataset.value = optionText.toLowerCase().replace(/\s+/g, '-');
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

  // Hide original block structure (keep for Universal Editor)
  [...block.children].forEach((child) => {
    child.style.display = 'none';
  });

  // Add custom dropdown for display
  block.appendChild(dropdownWrapper);
}
