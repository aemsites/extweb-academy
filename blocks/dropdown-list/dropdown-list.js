export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];

  // Clear the block
  block.innerHTML = '';

  // Create container for dropdowns and button
  const container = document.createElement('div');
  container.className = 'dropdown-list-container';

  // Process each row (except the last one which should be the button)
  const dropdowns = [];

  rows.forEach((row) => {
    const cells = [...row.children];

    // Check if this row is the button row
    if (cells[0]?.textContent.trim().toLowerCase().includes('button') || cells[0]?.querySelector('a')) {
      // This is the button row
      const button = document.createElement('button');
      const link = cells[0].querySelector('a');

      if (link) {
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
      } else {
        button.textContent = cells[0].textContent.trim();
      }

      container.appendChild(button);
    } else if (cells.length >= 2) {
      // This is a dropdown row
      const select = document.createElement('select');
      const label = cells[0].textContent.trim();
      const options = cells[1].textContent.split(',').map((opt) => opt.trim());

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
        if (optionText) {
          const option = document.createElement('option');
          option.value = optionText.toLowerCase().replace(/\s+/g, '-');
          option.textContent = optionText;
          select.appendChild(option);
        }
      });

      dropdowns.push(select);
      container.appendChild(select);
    }
  });

  block.appendChild(container);
}
