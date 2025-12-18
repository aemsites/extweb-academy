export default function decorate(block) {
  // Get all dropdown-item children
  const items = [...block.children];
  
  // If no items, show placeholder message
  if (items.length === 0) {
    block.innerHTML = '<p style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc;">⚠️ Please add Dropdown Items to this block in the Universal Editor.</p>';
    return;
  }
  
  // Get placeholder text from block metadata (first div in block)
  const blockMetadata = block.querySelector(':scope > div:first-child');
  let placeholderText = 'Select Option';
  
  if (blockMetadata) {
    const placeholderDiv = blockMetadata.querySelector('div');
    if (placeholderDiv) {
      placeholderText = placeholderDiv.textContent.trim() || 'Select Option';
    }
    blockMetadata.remove();
  }
  
  // Create custom dropdown container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.className = 'custom-dropdown';
  dropdownContainer.dataset.type = placeholderText.toLowerCase().replace(/\s+/g, '-');
  
  // Create selected display
  const selectedDiv = document.createElement('div');
  selectedDiv.className = 'selected';
  
  const selectedSpan = document.createElement('span');
  selectedSpan.className = 'selectedspan';
  selectedSpan.textContent = placeholderText;
  
  selectedDiv.appendChild(selectedSpan);
  dropdownContainer.appendChild(selectedDiv);
  
  // Create options container
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'options';
  optionsDiv.style.display = 'none';
  
  // Process each dropdown-item
  items.forEach((item) => {
    const divs = [...item.children];
    
    if (divs.length > 0) {
      const optionDiv = divs[0];
      const optionText = optionDiv.textContent.trim();
      
      if (optionText) {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.attr = `${placeholderText.toLowerCase().replace(/\s+/g, '-')}/${optionText.toLowerCase().replace(/\s+/g, '-')}`;
        option.textContent = optionText;
        
        // Add click handler for option
        option.addEventListener('click', () => {
          selectedSpan.textContent = optionText;
          selectedDiv.classList.add('active');
          optionsDiv.style.display = 'none';
        });
        
        optionsDiv.appendChild(option);
      }
    }
    
    // Remove original item
    item.remove();
  });
  
  dropdownContainer.appendChild(optionsDiv);
  
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
    if (optionsDiv.style.display === 'none') {
      optionsDiv.style.display = 'block';
    } else {
      optionsDiv.style.display = 'none';
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    optionsDiv.style.display = 'none';
  });
  
  // Clear block and add custom dropdown
  block.innerHTML = '';
  block.appendChild(dropdownContainer);
}
