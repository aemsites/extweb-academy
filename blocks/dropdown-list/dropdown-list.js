export default function decorate(block) {
  // Get all dropdown-item children
  const items = [...block.children];
  // Create container for dropdowns and button
  const container = document.createElement('div');
  container.className = 'dropdown-list-container';

  // Array to store dropdown elements
  const dropdowns = [];

  items.forEach((item) => {
    // Each item has two divs: label and options
    const divs = [...item.children];

    if (divs.length >= 2) {
      const labelDiv = divs[0];
      const optionsDiv = divs[1];

      // Check if this is a button (has a link)
      const link = optionsDiv.querySelector('a');

      if (link) {
        // This is the button item
        const button = document.createElement('button');
        button.textContent = link.textContent;
        button.addEventListener('click', () => {
          // Collect all selected values
          const params = new URLSearchParams();
          dropdowns.forEach((dropdown) => {
            if (dropdown.value) {
              params.append(dropdown.dataset.param, dropdown.value);
            }
          });

          // Navigate to the link with parameters
          const baseUrl = link.href;
          const separator = baseUrl.includes('?') ? '&' : '?';
          window.location.href = `${baseUrl}${params.toString() ? separator + params.toString() : ''}`;
        });

        container.appendChild(button);
      } else {
        // This is a dropdown item
        const select = document.createElement('select');
        const label = labelDiv.textContent.trim();
        const optionsText = optionsDiv.textContent.trim();

        // Parse options (comma-separated)
        const options = optionsText.split(',').map((opt) => opt.trim()).filter((opt) => opt);

        // Set dataset for parameter name (used in URL)
        select.dataset.param = label.toLowerCase().replace(/\s+/g, '-');

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = label;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);

        // Add options
        options.forEach((optionText) => {
          const option = document.createElement('option');
          option.value = optionText.toLowerCase().replace(/\s+/g, '-');
          option.textContent = optionText;
          select.appendChild(option);
        });

        dropdowns.push(select);
        container.appendChild(select);
      }
    }

    // Remove original item
    item.remove();
  });

  block.appendChild(container);
}
