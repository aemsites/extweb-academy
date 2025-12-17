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
  
  // Create container for dropdowns and button
  const container = document.createElement('div');
  container.className = 'dropdown-list-container';
  
  // Create the select element
  const select = document.createElement('select');
  
  // Set dataset for parameter name (used in URL)
  select.dataset.param = placeholderText.toLowerCase().replace(/\s+/g, '-');
  
  // Add placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = placeholderText;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);
  
  // Process each dropdown-item
  items.forEach((item) => {
    const divs = [...item.children];
    
    if (divs.length > 0) {
      const optionDiv = divs[0];
      const optionText = optionDiv.textContent.trim();
      
      if (optionText) {
        const option = document.createElement('option');
        option.value = optionText.toLowerCase().replace(/\s+/g, '-');
        option.textContent = optionText;
        select.appendChild(option);
      }
    }
    
    // Remove original item
    item.remove();
  });
  
  // Add select to container
  container.appendChild(select);
  
  // Check if there's a button (last item might be a button/link)
  // For now, we'll add this functionality later if needed
  
  block.appendChild(container);
}
