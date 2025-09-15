console.log("script.js loaded!");
document.addEventListener('DOMContentLoaded', () => {
  const productCards = document.querySelectorAll('.product-card');
  const materialSelect = document.getElementById('material-select');
  const colorSelect = document.getElementById('color-select');
  const hardwareSelect = document.getElementById('hardware-select');
  const dimensionInput = document.getElementById('dimension-input');
  const orderSummaryText = document.getElementById('order-summary-text');
  const searchInput = document.getElementById('search-input');
  const materialFilter = document.getElementById('material-filter');
  const styleFilter = document.getElementById('style-filter');

  let selectedProduct = null;

  // Product selection logic
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove selection from others
      productCards.forEach(c => c.classList.remove('selected'));
      // Mark this one selected
      card.classList.add('selected');

      // Set selected product
      selectedProduct = {
        name: card.dataset.name,
        material: card.dataset.material,
        style: card.dataset.style,
        description: card.dataset.description,
      };

      // Update material select to match product
      materialSelect.value = selectedProduct.material;

      updateOrderSummary();
    });
  });

  // Update order summary on customization changes
  [materialSelect, colorSelect, hardwareSelect, dimensionInput].forEach(el => {
    el.addEventListener('input', updateOrderSummary);
  });

  // Search and filtering
  function filterProducts() {
    const searchValue = searchInput.value.toLowerCase();
    const materialValue = materialFilter.value;
    const styleValue = styleFilter.value;

    productCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const material = card.dataset.material;
      const style = card.dataset.style;

      const matchesSearch = name.includes(searchValue);
      const matchesMaterial = materialValue === '' || material === materialValue;
      const matchesStyle = styleValue === '' || style === styleValue;

      if (matchesSearch && matchesMaterial && matchesStyle) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
        // If the hidden card was selected, deselect it
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
          selectedProduct = null;
          clearCustomization();
          updateOrderSummary();
        }
      }
    });
  }

  [searchInput, materialFilter, styleFilter].forEach(el => {
    el.addEventListener('input', filterProducts);
  });

  function clearCustomization() {
    dimensionInput.value = '';
    materialSelect.value = '';
    colorSelect.value = '';
    hardwareSelect.value = '';
  }

  function updateOrderSummary() {
    if (!selectedProduct) {
      orderSummaryText.textContent = 'No product selected';
      return;
    }

    const dimensions = dimensionInput.value || 'N/A';
    const material = materialSelect.value || 'N/A';
    const color = colorSelect.value || 'N/A';
    const hardware = hardwareSelect.value || 'N/A';

    orderSummaryText.textContent = 
      `Product: ${selectedProduct.name}\n` +
      `Style: ${selectedProduct.style}\n` +
      `Dimensions: ${dimensions}\n` +
      `Material: ${material}\n` +
      `Color: ${color}\n` +
      `Hardware: ${hardware}`;
  }
});
