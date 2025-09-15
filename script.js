// Wait until DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const productCards = Array.from(document.querySelectorAll('.product-card'));
  const searchInput = document.querySelector('.search-filter input[type="text"]');
  
  // For material and style selection we'll create arrays and state
  const materialSelect = document.querySelector('.customization select:nth-of-type(1)');
  const colorSelect = document.querySelector('.customization select:nth-of-type(2)');
  const hardwareSelect = document.querySelector('.customization select:nth-of-type(3)');
  const dimensionInput = document.querySelector('.customization input[type="text"]');
  const orderSummary = document.getElementById('order-summary-text');

  // Track selections
  let selectedStyle = null;
  let selectedMaterial = materialSelect.value;
  let selectedColor = colorSelect.value;
  let selectedHardware = hardwareSelect.value;
  let selectedDimensions = dimensionInput.value || '';

  // ----- Helper to update order summary -----
  function updateOrderSummary() {
    if (!selectedStyle) {
      orderSummary.textContent = 'Please select a door style.';
      return;
    }
    
    const styleText = selectedStyle.querySelector('h3').textContent;
    const dimensionsText = selectedDimensions ? selectedDimensions : 'Dimensions not set';
    const colorText = selectedColor || 'Color not set';
    const hardwareText = selectedHardware || 'Hardware not set';

    orderSummary.textContent = `${styleText} - ${dimensionsText} - ${colorText} - ${hardwareText}`;
  }

  // ----- Style selection -----
  productCards.forEach(card => {
    card.style.cursor = 'pointer'; // make it obvious it's clickable
    card.addEventListener('click', () => {
      // Remove 'selected' class from all cards
      productCards.forEach(c => c.classList.remove('selected'));
      // Add 'selected' class to clicked card
      card.classList.add('selected');
      selectedStyle = card;
      updateOrderSummary();
    });
  });

  // ----- Material, Color, Hardware change listeners -----
  materialSelect.addEventListener('change', e => {
    selectedMaterial = e.target.value;
    updateOrderSummary();
  });

  colorSelect.addEventListener('change', e => {
    selectedColor = e.target.value;
    updateOrderSummary();
  });

  hardwareSelect.addEventListener('change', e => {
    selectedHardware = e.target.value;
    updateOrderSummary();
  });

  // ----- Dimensions input -----
  dimensionInput.addEventListener('input', e => {
    selectedDimensions = e.target.value;
    updateOrderSummary();
  });

  // ----- Search bar filtering -----
  searchInput.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    productCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      if (title.includes(term)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Initialize the order summary text
  updateOrderSummary();
});
