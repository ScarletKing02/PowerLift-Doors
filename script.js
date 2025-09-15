console.log("script.js loaded!");
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const productCards = document.querySelectorAll('.product-card');
  const customizationForm = document.querySelector('.customization form');
  const materialSelect = customizationForm.querySelector('select:nth-of-type(1)');
  const colorSelect = customizationForm.querySelector('select:nth-of-type(2)');
  const hardwareSelect = customizationForm.querySelector('select:nth-of-type(3)');
  const dimensionInput = customizationForm.querySelector('input[type="text"]');
  const orderSummary = document.getElementById('order-summary-text');
  const searchInput = document.querySelector('.search-filter input[type="text"]');

  let selectedProduct = null;

  // Select product card
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      // Only one selected product at a time
      if (selectedProduct) {
        selectedProduct.classList.remove('selected');
      }
      selectedProduct = card;
      card.classList.add('selected');
      updateOrderSummary();
    });
  });

  // Update summary on customization changes
  [materialSelect, colorSelect, hardwareSelect, dimensionInput].forEach(elem => {
    elem.addEventListener('input', updateOrderSummary);
    elem.addEventListener('change', updateOrderSummary);
  });

  // Search filter for product cards by name
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    productCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(term) ? '' : 'none';
    });
  });

  function updateOrderSummary() {
    const productName = selectedProduct ? selectedProduct.querySelector('h3').textContent : 'No product selected';
    const dimensions = dimensionInput.value.trim() || 'Default dimensions';
    const material = materialSelect.value || 'Default material';
    const color = colorSelect.value || 'No color selected';
    const hardware = hardwareSelect.value || 'Standard hardware';

    orderSummary.textContent = `${productName} - ${dimensions} - ${color} - ${hardware}`;
  }

  // Initialize order summary on page load
  updateOrderSummary();
});
