console.log("script.js loaded!");

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const resultsDiv = document.getElementById('product-gallery');
  const statusDiv = document.getElementById('status');
  const sortSelect = document.getElementById('sort-select');
  const materialFilter = document.getElementById('material-filter');

  // Customization controls
  const dimensionWidth = document.getElementById('dimension-width');
  const dimensionHeight = document.getElementById('dimension-height');
  const materialSelect = document.getElementById('custom-material');
  const colorInput = document.getElementById('custom-color');
  const hardwareInputs = document.querySelectorAll('input[name="hardware"]');

  let currentProducts = [];

  // Fetch products from DummyJSON
  async function fetchProducts(query) {
    resultsDiv.innerHTML = '';
    statusDiv.textContent = 'Loading...';
    try {
      const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();

      if (!data.products || data.products.length === 0) {
        statusDiv.textContent = "It's just us chickens here 🐔";
        currentProducts = [];
        return;
      }

      currentProducts = data.products.map(product => {
        // Determine material tag
        let material = 'Other';
        const titleDesc = (product.title + ' ' + product.description).toLowerCase();
        if (titleDesc.includes('wood')) material = 'Wood';
        else if (titleDesc.includes('steel') || titleDesc.includes('metal')) material = 'Metal';
        return { ...product, material };
      });

      statusDiv.textContent = '';
      renderProducts(currentProducts);
    } catch (err) {
      console.error(err);
      statusDiv.textContent = 'Error fetching products. Try again.';
    }
  }

  // Render products
  function renderProducts(products) {
    resultsDiv.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.thumbnail}" alt="Style: ${product.title}">
        <div class="material-badge">${product.material}</div>
        <h3>${product.title}</h3>
        <p class="description">${product.description}</p>
        <p>Price: $${product.price}</p>
        <button class="add-to-build">Add to Build</button>
      `;

      // Add to Build button
      card.querySelector('.add-to-build').addEventListener('click', () => {
        const selectedHardware = Array.from(hardwareInputs)
          .filter(h => h.checked)
          .map(h => h.value);
        const payload = {
          id: product.id,
          title: product.title,
          basePrice: product.price,
          imageUrl: product.thumbnail,
          timestamp: new Date().toISOString(),
          selectedOptions: {
            width: dimensionWidth.value || 'N/A',
            height: dimensionHeight.value || 'N/A',
            material: materialSelect.value || product.material,
            color: colorInput.value || 'N/A',
            hardware: selectedHardware
          }
        };
        console.log('Add to Build payload:', payload);
      });

      resultsDiv.appendChild(card);
    });
  }

  // Filter by material
  function applyFilters() {
    let filtered = [...currentProducts];
    const materialValue = materialFilter.value;
    if (materialValue) {
      filtered = filtered.filter(p => p.material === materialValue);
    }

    // Sorting
    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sortValue === 'price-desc') filtered.sort((a, b) => b.price - a.price);

    renderProducts(filtered);
  }

  // Event listeners
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) fetchProducts(query);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) fetchProducts(query);
    }
  });

  sortSelect.addEventListener('change', applyFilters);
  materialFilter.addEventListener('change', applyFilters);
});
