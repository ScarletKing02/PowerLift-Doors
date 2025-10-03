console.log("script.js loaded!");

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const materialFilter = document.getElementById("material-filter");
  const statusMessage = document.getElementById("status-message");
  const productsGrid = document.getElementById("products-grid");

  const materialSelect = document.getElementById("material-select");
  const colorSelect = document.getElementById("color-select");
  const hardwareSelect = document.getElementById("hardware-select");
  const dimensionInput = document.getElementById("dimension-input");
  const orderSummaryText = document.getElementById("order-summary-text");
  const addToBuildBtn = document.getElementById("add-to-build");

  let products = [];
  let selectedProduct = null;

  async function fetchProducts(query) {
    statusMessage.textContent = "Loading...";
    productsGrid.innerHTML = "";

    try {
      const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      products = data.products || [];

      if (products.length === 0) {
        statusMessage.textContent = "It’s just us chickens here 🐔";
        return;
      }

      statusMessage.textContent = "";
      renderProducts();
    } catch (err) {
      console.error(err);
      statusMessage.textContent = "Error loading products. Try again.";
    }
  }

  function renderProducts() {
    productsGrid.innerHTML = "";
    let filtered = [...products];

    const materialValue = materialFilter.value.toLowerCase();
    if (materialValue) {
      filtered = filtered.filter(p => {
        const mat = (p.title + " " + p.description).toLowerCase();
        if (materialValue === "wood") return mat.includes("wood");
        if (materialValue === "metal") return mat.includes("metal") || mat.includes("steel");
        if (materialValue === "other") return !mat.includes("wood") && !mat.includes("metal") && !mat.includes("steel");
        return true;
      });
    }

    const sortValue = sortSelect.value;
    if (sortValue === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "price") {
      filtered.sort((a, b) => a.price - b.price);
    }

    filtered.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.tabIndex = 0;

      card.innerHTML = `
        <img src="${product.thumbnail}" alt="Style: ${product.title}">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p><strong>$${product.price}</strong></p>
        <button class="select-btn" type="button">Select</button>
      `;

      card.querySelector(".select-btn").addEventListener("click", () => {
        document.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedProduct = product;
        updateOrderSummary();
      });

      card.addEventListener("keypress", e => {
        if (e.key === "Enter") card.querySelector(".select-btn").click();
      });

      productsGrid.appendChild(card);
    });
  }

  function updateOrderSummary() {
    if (!selectedProduct) {
      orderSummaryText.textContent = "No product selected";
      return;
    }

    const dimensions = dimensionInput.value || "N/A";
    const material = materialSelect.value || "N/A";
    const color = colorSelect.value || "N/A";
    const hardware = hardwareSelect.value || "N/A";

    orderSummaryText.textContent =
      `Product: ${selectedProduct.title}\n` +
      `Description: ${selectedProduct.description}\n` +
      `Price: $${selectedProduct.price}\n` +
      `Dimensions: ${dimensions}\n` +
      `Material: ${material}\n` +
      `Color: ${color}\n` +
      `Hardware: ${hardware}`;
  }

  addToBuildBtn.addEventListener("click", () => {
    if (!selectedProduct) {
      alert("Please select a product first!");
      return;
    }

    const payload = {
      product: selectedProduct.title,
      description: selectedProduct.description,
      price: selectedProduct.price,
      dimensions: dimensionInput.value,
      material: materialSelect.value,
      color: colorSelect.value,
      hardware: hardwareSelect.value,
      timestamp: new Date().toISOString()
    };

    console.log("Add to Build:", payload);
    alert("Product added to build! (See console for details)");
  });

  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      statusMessage.textContent = "Please enter a search term.";
      return;
    }
    fetchProducts(query);
  });

  [sortSelect, materialFilter].forEach(el => el.addEventListener("input", renderProducts));
  [materialSelect, colorSelect, hardwareSelect, dimensionInput].forEach(el => el.addEventListener("input", updateOrderSummary));
});
