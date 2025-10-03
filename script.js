(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsEl = document.getElementById('results');
    const initialState = document.getElementById('initial-state');
    const statusRegion = document.getElementById('status-region');
    const sortSelect = document.getElementById('sort-select');
    const materialFilter = document.getElementById('material-filter');

    // Customization controls
    const customizationForm = document.getElementById('customization-form');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const colorInput = document.getElementById('color-input');
    const hardwareCheckboxes = Array.from(customizationForm.querySelectorAll('input[type="checkbox"]'));
    const materialRadios = Array.from(customizationForm.querySelectorAll('input[name="material"]'));
    const orderSummaryText = document.getElementById('order-summary-text');

    // State
    let currentResults = []; // raw items from API mapped to our schema
    let displayedResults = []; // results after filter/sort

    // Constants
    const API_BASE = 'https://dummyjson.com/products/search?q=';
    const FALLBACK_IMAGE = 'https://picsum.photos/seed/powerlift/600/400';

    // Helpers
    function setStatus(text, isError = false) {
      statusRegion.textContent = text;
      statusRegion.style.color = isError ? '#a00' : '';
    }

    function clearStatus() {
      statusRegion.textContent = '';
    }

    function tagMaterialFromText(title = '', description = '') {
      const combined = (title + ' ' + description).toLowerCase();
      if (combined.includes('wood')) return 'Wood';
      if (combined.includes('metal') || combined.includes('steel')) return 'Steel';
      return 'Other';
    }

    function mapApiItem(item) {
      // Map DummyJSON product -> door style shape
      const title = item.title || item.brand || 'Untitled';
      const description = item.description || '';
      const price = typeof item.price === 'number' ? item.price : 0;
      const image = item.thumbnail || (item.images && item.images[0]) || FALLBACK_IMAGE;
      return {
        id: item.id,
        title,
        description,
        basePrice: price,
        imageUrl: image,
        materialTag: tagMaterialFromText(title, description),
        raw: item
      };
    }

    function renderInitialState() {
      initialState.style.display = '';
      resultsEl.innerHTML = '';
      setStatus(''); // clear
    }

    function renderLoading() {
      initialState.style.display = 'none';
      resultsEl.innerHTML = `<div class="state-box">Loading results…</div>`;
      setStatus('Loading results…');
    }

    function renderError(message) {
      initialState.style.display = 'none';
      resultsEl.innerHTML = '';
      const errBox = document.createElement('div');
      errBox.className = 'state-box';
      errBox.innerHTML = `
        <p><strong>Something went wrong:</strong> ${message}</p>
        <p><button id="retry-btn" type="button">Try again</button></p>
      `;
      resultsEl.appendChild(errBox);
      setStatus('An error occurred. Please try again.', true);
      const retryBtn = document.getElementById('retry-btn');
      retryBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) triggerSearch();
      });
    }

    function renderNoResults() {
      initialState.style.display = 'none';
      resultsEl.innerHTML = `<div class="state-box"><p>No results found for "<strong>${escapeHtml(searchInput.value)}</strong>". Try another search.</p></div>`;
      setStatus('No results found.');
    }

    function escapeHtml(str = '') {
      return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    function createCard(item) {
      // item: mapped item from mapApiItem
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.tabIndex = 0;

      const img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = `Style: ${item.title}`;
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.src = FALLBACK_IMAGE; });

      const title = document.createElement('h3');
      title.textContent = item.title;

      const meta = document.createElement('div');
      meta.className = 'meta';
      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = `$${item.basePrice.toFixed(2)}`;
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = item.materialTag;

      meta.appendChild(price);
      meta.appendChild(tag);

      const desc = document.createElement('p');
      desc.className = 'clamp-3';
      desc.textContent = item.description;

      const actions = document.createElement('div');
      actions.className = 'actions';
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = 'Add to Build';
      addBtn.addEventListener('click', () => onAddToBuild(item));
      addBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAddToBuild(item);
        }
      });

      const detailsBtn = document.createElement('button');
      detailsBtn.type = 'button';
      detailsBtn.className = 'secondary';
      detailsBtn.textContent = 'Preview';
      detailsBtn.addEventListener('click', () => {
        // update preview (order summary) to show this selection
        updatePreviewForItem(item);
      });

      actions.appendChild(addBtn);
      actions.appendChild(detailsBtn);

      // Build card
      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(desc);
      card.appendChild(actions);

      return card;
    }

    function renderResults(list) {
      resultsEl.innerHTML = '';
      if (!list || list.length === 0) {
        renderNoResults();
        return;
      }
      // create fragment for performance
      const frag = document.createDocumentFragment();
      list.forEach(item => {
        const card = createCard(item);
        frag.appendChild(card);
      });
      resultsEl.appendChild(frag);
      setStatus(`Showing ${list.length} result(s).`);
    }

    function applyFiltersAndSort() {
      // Start from currentResults
      let arr = [...currentResults];

      // material filter
      const mat = materialFilter.value;
      if (mat) {
        arr = arr.filter(it => it.materialTag === mat);
      }

      // sort
      const sort = sortSelect.value;
      if (sort === 'price-asc') {
        arr.sort((a, b) => a.basePrice - b.basePrice);
      } else if (sort === 'price-desc') {
        arr.sort((a, b) => b.basePrice - a.basePrice);
      } // relevance default: keep order returned by API

      displayedResults = arr;
      renderResults(displayedResults);
    }

    async function triggerSearch() {
      const q = searchInput.value.trim();
      if (!q) {
        setStatus('Please enter a search term.');
        return;
      }

      // UI states
      renderLoading();

      try {
        const url = `${API_BASE}${encodeURIComponent(q)}&limit=20`;
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`Server returned ${resp.status}`);
        }
        const data = await resp.json();
        // DummyJSON returns { products: [...] }
        const items = data.products || [];
        // map to our schema
        currentResults = items.map(mapApiItem);
        // reset filters to default (but keep selected material if desired)
        applyFiltersAndSort();
        initialState.style.display = 'none';
      } catch (err) {
        console.error('Fetch error', err);
        renderError(err.message || 'Network error');
      }
    }

    // Add to Build handler
    function onAddToBuild(item) {
      // read customization options
      const width = parseFloat(widthInput.value) || null;
      const height = parseFloat(heightInput.value) || null;
      const selectedMaterial = materialRadios.find(r => r.checked)?.value || 'Wood';
      const color = colorInput.value || '#000000';
      const hardware = hardwareCheckboxes.filter(cb => cb.checked).map(cb => cb.value);

      const payload = {
        id: item.id,
        title: item.title,
        basePrice: item.basePrice,
        imageUrl: item.imageUrl,
        timestamp: new Date().toISOString(),
        dimensions: { width, height },
        material: selectedMaterial,
        color,
        hardware,
      };

      // Log structured payload to console
      console.info('Add to Build payload:', payload);

      // Update UI preview summary
      orderSummaryText.textContent = `Selected: ${item.title} — ${width}ft × ${height}ft, ${selectedMaterial}, ${hardware.length ? hardware.join(', ') : 'No extras'}.`;
      setStatus(`Added "${item.title}" to build (logged to console).`);
    }

    function updatePreviewForItem(item) {
      // show item in preview using current customization values
      const width = parseFloat(widthInput.value) || null;
      const height = parseFloat(heightInput.value) || null;
      const selectedMaterial = materialRadios.find(r => r.checked)?.value || 'Wood';
      const hardware = hardwareCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
      orderSummaryText.textContent = `${item.title} — ${width}ft × ${height}ft, ${selectedMaterial}, ${hardware.length ? hardware.join(', ') : 'No extras'}`;
    }

    // wire events
    searchButton.addEventListener('click', triggerSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSearch();
      }
    });

    sortSelect.addEventListener('change', () => {
      applyFiltersAndSort();
    });
    materialFilter.addEventListener('change', () => {
      applyFiltersAndSort();
    });

    // Keep preview/order summary updated when customization changes
    [widthInput, heightInput, colorInput, ...hardwareCheckboxes, ...materialRadios].forEach(el => {
      el.addEventListener('input', () => {
        // If a product is currently visible and selected via preview, keep it updated
        // We simply update the order summary text (no persistence required yet)
        const firstItem = displayedResults[0];
        if (firstItem) updatePreviewForItem(firstItem);
      });
    });

    // Initial state render
    renderInitialState();

    // Expose a minimal debug method (non-global): attach to button for convenience in dev:
    // (not required — kept internal)
  });
})();
