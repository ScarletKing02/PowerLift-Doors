console.log("script.js loaded!");

document.addEventListener('DOMContentLoaded', () => {
  const productGallery = document.querySelector('.product-gallery');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const orderSummaryText = document.getElementById('order-summary-text');

  const dimensionInput = document.getElementById('dimension-input');
  const materialSelect = document.getElementById('material-select');
  const colorSelect = document.getElementById('color-select');
  const hardwareSelect = document.getElementById('hardware-select');

  let currentProducts = [];

  function clearGallery() {
    productGallery.innerHTML = '';
  }

  function showMessage(message) {
    clearGallery();
    const msgEl = document.createElement('p');
    msgEl.textContent = message;
    msgEl.style.fontSize = '1.2em';
    msgEl.style.textAlign = 'center';
    productGallery.appendChild(msgEl);
  }

  async function fetchProducts(query) {
    clearGallery();
    showMessage('Loading...');

    try {
      const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!response.ok) throw new Error('Network response not OK');
      const data = await response.json();
      const products = data.products;

      if (!products || products.length === 0) {
        showMessage("It's just us chickens here");
        currentProducts = [];
        return;
      }

      currentProducts = products;
      renderProducts(products);
    } catch (err) {
      showMessage('Error fetching products. Try again.');
      console.error(err);
    }
  }

  function renderProducts(products) {
    clearGallery();
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const img = document.createElement('img');
      img.src = prod.thumbnail || prod.images?.[0] || '';
      img.alt = `Style: ${prod.title}`;

      const title = document.createElement('h3');
      title.textContent = prod.title;

      const desc = document.createElement('p');
      desc.textContent = prod.description.length > 80 ? prod.description.slice(0, 80) + '...' : prod.description;

      const price = document.createElement('p');
      price.textContent = `$${prod.price}`;

      const btn = document.createElement('button');
      btn.textContent = 'Add to Build';
      btn.addEventListener('click', () => {
        const payload = {
          id: prod.id,
          title: prod.title,
          basePrice: prod.price,
          imageUrl: img.src,
          timestamp: new Date().toISOString(),
          customization: {
            dimensions: dimensionInput.value || 'N/A',
            material: materialSelect.value || 'N/A',
            color: colorSelect.value || 'N/A',
            hardware: hardwareSelect.value || 'N/A'
          }
        };
        console.log('Added to build:', payload);
        orderSummaryText.textContent = `Product added: ${prod.title}`;
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(desc);
      card.appendChild(btn);

      productGallery.appendChild(card);
    });
  }

  // Handle search form submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent reload
    const query = searchInput.value.trim();
    if (!query) return;
    fetchProducts(query);
  });
});
