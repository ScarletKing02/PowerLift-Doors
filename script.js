console.log("script.js loaded!");

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const resultsContainer = document.getElementById("results");

  const customizationForm = document.getElementById("customizationForm");
  const dimensionInput = document.getElementById("dimension-input");
  const materialSelect = document.getElementById("material-select");
  const colorSelect = document.getElementById("color-select");
  const hardwareSelect = document.getElementById("hardware-select");

  const orderSummary = document.getElementById("orderSummary");
  const productName = document.getElementById("productName");
  const productSummary = document.getElementById("productSummary");
  const summaryDetails = document.getElementById("summaryDetails");

  let selectedProduct = null;

  // Fetch products from DummyJSON
  async function searchProducts(query) {
    resultsContainer.innerHTML = "<p>Loading...</p>";
    try {
      const res = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();

      if (data.products.length === 0) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        return;
      }

      renderProducts(data.products);
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = "<p>Error fetching products.</p>";
    }
  }

  // Render product cards
  function renderProducts(products) {
    resultsContainer.innerHTML = "";
    const grid = document.createElement("div");
    grid.classList.add("product-gallery");

    products.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" />
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p>$${product.price}</p>
        <button>Add to Build</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        selectedProduct = product;
        updateSummary();
      });

      grid.appendChild(card);
    });

    resultsContainer.appendChild(grid);
  }

  // Update order summary
  function updateSummary() {
    if (!selectedProduct) return;
    orderSummary.style.display = "block";
    productName.textContent = selectedProduct.title;
    productSummary.textContent = `Base price: $${selectedProduct.price}`;

    const dimensions = dimensionInput.value || "N/A";
    const material = materialSelect.value || "N/A";
    const color = colorSelect.value || "N/A";
    const hardware = hardwareSelect.value || "N/A";

    summaryDetails.textContent = `Dimensions: ${dimensions}, Material: ${material}, Color: ${color}, Hardware: ${hardware}`;

    // Log payload to console
    console.log({
      product: selectedProduct,
      customization: { dimensions, material, color, hardware },
    });
  }

  // Event listeners
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) searchProducts(query);
  });

  customizationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updateSummary();
  });
});
