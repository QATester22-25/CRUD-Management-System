const homeBtn = document.getElementById("home-btn");
const createBtn = document.getElementById("create-btn");
const inventoryBtn = document.getElementById("inventory-btn");
const landingCreateBtn = document.getElementById("create");
const landingInventoryBtn = document.getElementById("inventory");
const deleteAllBtn = document.getElementById("delete-all");
const showInventoryBtn = document.getElementById("show-inventory");
const searchBtn = document.getElementById("search-title");
const submit = document.getElementById("submit");
const cancelBtn = document.querySelector(".cancel-btn");
const saleBtn = document.getElementById("sale-icon");
const saleInput = document.getElementById("sale-input");
const saleCancelBtn = document.querySelector(".sale-cancel-button");
const saleSelect = document.getElementById("sale-count");
const saleProductBtn = document.querySelector(".sale-button");

const bodyContainer = document.querySelector(".container");
const createSection = document.getElementById("create-section");
const inventorySection = document.getElementById("inventory-section");
const homeSection = document.getElementById("home-section");
const searchSection = document.querySelector(".search");
const showCreate = document.getElementById("show-create");
const saleSection = document.getElementById("sale-section");
const saleTable = document.querySelector(".sale-table");
const saleHeader = document.querySelector(".sale-search");
const saleNowSection = document.getElementById("sale-now-section");

const errorRef = document.getElementById("ref");
const errorCount = document.getElementById("count-error");
const errorPrice = document.getElementById("price-error");
const createNotification = document.getElementById("create-notification");
const inventoryNotification = document.getElementById("inventory-notification");
const saleErrorMsg = document.querySelector(".sale-error-msg");
const saleNotification = document.getElementById("sale-notification");

const reference = document.getElementById("reference");
const title = document.getElementById("title");
const price = document.getElementById("price");
const discount = document.getElementById("discount");
const discountAmount = document.querySelector(".discount-amount");
const amountSpan = document.querySelector(".span");
const total = document.getElementById("total");
const count = document.getElementById("count");
const category = document.getElementById("category");
const countLabel = document.querySelector(".count-label");
const totalTitle = document.querySelector(".total-title");
const inputSearch = document.getElementById("search");

////////////////////1- Calculate discount  -//////////////////////////

//initialize empty variable;
let rate;

function getDiscount() {
  const select = document.getElementById("discount");

  const selectedValue = Number(select.value);
  const t = selectedValue / 100;
  const convertedDiscount = Number(price.value) * t;

  if (Number(price.value) > 0 && selectedValue > 0) {
    discountAmount.innerHTML = convertedDiscount.toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  } else {
    discountAmount.innerHTML = "";
  }

  rate = Number(price.value) - convertedDiscount;

  getTotal();
}

///////////////// 2- get total - //////////////////////////////
function getTotal() {
  //result is required
  if (price.value != "") {
    let result = rate;

    total.innerHTML = Number(result).toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

    total.classList.add("total");
    totalTitle.innerText = "TOTAL";
    total.style.background = " #26449d";

    //price is empty
  } else {
    total.innerHTML = "";
    total.classList.remove("total");
    totalTitle.innerText = "";
  }
}

//Call getDiscount function with select eventListener
discount.addEventListener("change", function () {
  getDiscount();
});

let dataProduct;

function enrichProduct(product) {
  const productPrice = Number(product.price);
  const discountRate = Number(product.discount);

  const discountValue = (productPrice * discountRate) / 100;
  const totalValue = productPrice - discountValue;

  return {
    ...product,
    discountAmount: discountValue.toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }),
    total: totalValue.toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }),
  };
}

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Statut HTTP :", response.status);
      console.error("Réponse du serveur :", errorText);

      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const products = await response.json();

    dataProduct = products.map(enrichProduct);

    /////////changed
    if (dataProduct.length > 0) {
      showProductData();
      showSaleProduct();
      document.getElementById("table-body").classList.remove("hide");
      document.querySelector(".no-products").classList.add("hide");
      document.querySelector(".no_products_img").classList.add("hide");
    } else {
      document.getElementById("table-body").classList.add("hide");
      document.querySelector(".no-products").classList.remove("hide");
      document.querySelector(".no_products_img").classList.remove("hide");
    }

    console.log("Produits chargés depuis MySQL :", dataProduct);
  } catch (error) {
    console.error("Erreur de chargement :", error);
    showNotification("Impossible de charger les produits");
  }
}

loadProducts();

//initialize empty variable;
let tmp;

//initialize mood
let mood = "create";

//////////////// 3- Submit for Create / Update product - ////////////////////////////
submit.onclick = async function () {
  //declare product object
  let newProduct = {
    reference: reference.value,
    title: title.value.toLowerCase(),
    category: category.value.toLowerCase(),
    count: count.value,
    price: price.value,
    discount: discount.value,
    discountAmount: discountAmount.innerHTML,
    total: total.innerHTML,
  };

  if (price.value > 0 && count.value > 0) {
    //////////////////////Create Product///////////////////////////////////////

    if (mood === "create") {
      cancelBtn.style.display = "none";

      try {
        const response = await fetch("http://localhost:3000/api/products", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: newProduct.reference.trim(),
            title: newProduct.title,
            category: newProduct.category,
            count: Number(newProduct.count),
            price: Number(newProduct.price),
            discount: Number(newProduct.discount),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          createNotification.classList.add("error-notification");
          showNotification(result.message || "Unable to create product");
          return;
        }

        // Reload products from MySQL
        await loadProducts();

        clearData();

        createNotification.classList.remove("error-notification");
        showNotification("Product created successfully");

        errorRef.classList.remove("ref-error");
        errorRef.innerText = "";
        totalTitle.innerText = "";

        console.log("Product created in MySQL:", result);
      } catch (error) {
        showNotification("Unable to connect to the server");
        console.error("Create product error:", error);
      }
    } else {
      // UPDATE product in MySQL

      const productId = dataProduct[tmp].id;

      try {
        errorRef.classList.remove("ref-error");
        errorRef.innerText = "";

        const response = await fetch(
          `http://localhost:3000/api/products/${productId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference: newProduct.reference.trim(),
              title: newProduct.title,
              category: newProduct.category,
              count: Number(newProduct.count),
              price: Number(newProduct.price),
              discount: Number(newProduct.discount),
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            errorRef.classList.add("ref-error");
            errorRef.innerText = result.message;
          } else {
            showNotification(result.message || "Unable to update product");
          }

          return;
        }

        // Reload the latest products from MySQL
        await loadProducts();

        mood = "create";
        submit.innerHTML = "Create";
        count.removeAttribute("disabled");
        count.style.display = "block";
        totalTitle.innerText = "";

        showInventorySection();
        clearData();

        createNotification.classList.remove("error-notification");
        showNotification("Updated successfully");

        console.log("Product updated in MySQL:", result, newProduct);
      } catch (error) {
        showNotification("Unable to connect to the server");
        console.error("Update product error:", error);
      }
    }
  }
};

//clear inputs
function clearData() {
  reference.value = "";
  title.value = "";
  price.value = "";
  discount.value = "";
  total.innerHTML = "";
  count.value = "";
  category.value = "";
  total.style.background = "transparent";
  errorCount.innerText = "";
  errorPrice.innerText = "";
  total.classList.remove("total");
  inputSearch.value = "";
}

//Read - show products
function showProductData() {
  let table = "";
  for (let i = 0; i < dataProduct.length; i++) {
    table += `<tr>
        <td class="data">${dataProduct[i].reference}</td>
        <td class="data">${dataProduct[i].title}</td>
        <td class="data">${dataProduct[i].category}</td>
        <td class="data">${dataProduct[i].count}</td>
        <td class="data">${Number(dataProduct[i].price).toLocaleString(
          "fr-FR",
          {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          },
        )}</td>
        <td class="data">${dataProduct[i].discount}%</td>
        <td class="data">${dataProduct[i].discountAmount}</td>
        <td class="data">${dataProduct[i].total}</td>
        <td><button onclick="updateProduct(${i}),showCreateSection()" id="update">update</button></td>
        <td><button onclick="deleteProduct(${i})" id="delete">delete</button></td>
      </tr>`;

    //add deleteAll button if there's at list one product
    if (dataProduct.length > 0) {
      deleteAllBtn.innerHTML = `<button  onclick="deleteAll()" id="deleteAll">Delete All (${dataProduct.length})</button>`;
    } else if (dataProduct.length === 0) {
      document.getElementById("table-body").classList.add("hide");
      document.querySelector(".no-products").classList.remove("hide");
      document.querySelector(".no_products_img").classList.remove("hide");
      console.log(dataProduct.length);
    }
  }

  //add products to the table
  document.getElementById("tbody").innerHTML = table;
  deleteAllBtn.classList.remove("delete-all-hide");
}

//delete product
async function deleteProduct(i) {
  // Get the MySQL ID of the selected product
  const productId = dataProduct[i].id;

  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to delete product.");
    }

    // Refresh products from MySQL
    await loadProducts();

    // Notification
    showNotification("The product has been deleted");
    inventoryNotification.classList.add("error-notification");
    createNotification.classList.remove("error-notification");
  } catch (error) {
    console.error("Delete product error:", error);
    showNotification("Error deleting product");
  }
}

// Delete All
async function deleteAll() {
  try {
    const response = await fetch("http://localhost:3000/api/products", {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to delete all products.");
    }

    // Refresh products from MySQL
    await loadProducts();

    // Clear the button content
    deleteAllBtn.innerHTML = "";
    document.getElementById("tbod").innerHTML = "";
    document.getElementById("table-body").classList.add("hide");
    document.querySelector(".no-products").classList.remove("hide");
    document.querySelector(".no_products_img").classList.remove("hide");

    // Notification
    showNotification("All products have been deleted");
    createNotification.classList.add("error-notification");
    console.log("all products have been deleted from db");
  } catch (error) {
    console.error("Delete all products error:", error);
    showNotification("Error deleting all products");
  }
}

//Update
function updateProduct(i) {
  // Retrieve the selected product
  const product = dataProduct[i];
  console.log("Produit sélectionné :", product);
  console.log("Mode :", mood);

  // Fill the inputs
  reference.value = product.reference;
  title.value = product.title;
  category.value = product.category;
  price.value = product.price;
  discount.value = String(Number(product.discount));
  count.value = product.count;

  // Switch to update mode
  tmp = i;
  mood = "update";

  submit.innerHTML = "Update";
  cancelBtn.style.display = "block";
  submit.style.background = "rgb(147, 100, 147)";

  // Recalculate discount and total
  getDiscount();
  getTotal();

  totalTitle.innerText = "";
  document.querySelector(".price-discount-labels").style.marginTop = "0px";
  document.querySelector(".prod-mang-title").style.marginBottom = "5px";

  // Display the create section
  showCreateSection();
}

///////////////////////////Sale product/////////////////////////////////////

function showSaleProduct() {
  let table = "";
  for (let i = 0; i < dataProduct.length; i++) {
    table += `
      <tr>
         <td class="data">${dataProduct[i].reference}</td>
         <td class="data">${dataProduct[i].title}</td>
         <td class="data">${dataProduct[i].category}</td>
         <td class="data">${dataProduct[i].count}</td>
         <td class="data">${dataProduct[i].price}</td>
         <td class="data">${dataProduct[i].discount}</td>
         <td class="data">${dataProduct[i].discountAmount}</td>
         <td class="data">${dataProduct[i].total}</td>
         <td><button>Sale</button></td> 
        </tr>
    `;
  }
  document.getElementById("tbod").innerHTML = table;
}

//Notification
function showNotification(message) {
  createNotification.innerText = message;
  createNotification.classList.add("show");
  inventoryNotification.innerText = message;
  inventoryNotification.classList.add("show");
  saleNotification.innerHTML = message;
  saleNotification.classList.add("show");
  setTimeout(() => {
    createNotification.classList.remove("show");
    inventoryNotification.classList.remove("show");
    saleNotification.classList.remove("show");
  }, 3000);
}

price.addEventListener("blur", () => {
  if (price.value !== "") {
    price.value = Number(price.value).toFixed(3);
  }
});

//scroll table smoothly
const container = document.querySelector(".table");

container.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    container.scrollTop += event.deltaY * 0.1;
  },
  { passive: false },
);

/////////////////////////////////Search//////////////////////////////////////////

function searchProduct(value) {
  let table = "";

  for (let i = 0; i < dataProduct.length; i++) {
    if (
      dataProduct[i].title.toLowerCase().includes(value.toLowerCase()) ||
      dataProduct[i].category.toLowerCase().includes(value.toLowerCase()) ||
      dataProduct[i].reference === value.trim()
    ) {
      table += `<tr>
      
        <td class="data">${dataProduct[i].reference}</td>
        <td class="data">${dataProduct[i].title}</td>
        <td class="data">${dataProduct[i].category}</td>
        <td class="data">${dataProduct[i].count}</td>
        <td class="data">${Number(dataProduct[i].price).toLocaleString(
          "fr-FR",
          {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          },
        )}</td>
        <td class="data">${dataProduct[i].discount}%</td>
        <td class="data">${dataProduct[i].discountAmount}</td>
        <td class="data">${dataProduct[i].total}</td>
        <td><button onclick="updateProduct(${i}),showCreateSection()" id="update">update</button></td>
        <td><button onclick="deleteProduct(${i})" id="delete">delete</button></td>
      </tr>`;
    }
  }

  if (table === "") {
    document.getElementById("table-body").classList.add("hide");
    document.querySelector(".no-products").classList.remove("hide");
    document.querySelector(".no_products_img").classList.remove("hide");
  } else {
    document.getElementById("tbody").innerHTML = table;
    document.getElementById("table-body").classList.remove("hide");
    document.querySelector(".no-products").classList.add("hide");
    document.querySelector(".no_products_img").classList.add("hide");
  }
}

searchBtn.addEventListener("click", () => {
  if (inputSearch.value.trim() != "") {
    searchProduct(inputSearch.value);
    deleteAllBtn.classList.add("delete-all-hide");
    document.querySelector(".sale-img").classList.add("hide");
    inputSearch.value = "";
  } else {
    deleteAllBtn.classList.remove("delete-all-hide");
    document.querySelector(".no-products").classList.remove("hide");
    document.getElementById("table-body").classList.add("hide");
    document.querySelector(".no_products_img").classList.remove("hide");
    showProductData();
  }
});

inputSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter")
    if (inputSearch.value.trim() != "") {
      searchProduct(inputSearch.value);
      deleteAllBtn.classList.add("delete-all-hide");
      inputSearch.value = "";
      document.getElementById("sale_img").classList.add("hide");
    } else {
      deleteAllBtn.classList.remove("delete-all-hide");
      document.querySelector(".no-products").classList.remove("hide");
      document.getElementById("table-body").classList.add("hide");
      document.querySelector(".no_products_img").classList.remove("hide");
      showProductData();
    }
});

//////////////////////SaleSearch function////////////////////////////////
function saleSearch(value) {
  let table = "";
  value = value.trim().toLowerCase();

  // 1. Vérifier si le champ est vide
  if (value === "") {
    saleErrorMsg.classList.remove("hide");
    saleErrorMsg.classList.add("show");
    saleErrorMsg.innerHTML = "Please enter product first";

    saleTable.classList.remove("show");
    saleTable.classList.add("hide");
    document.getElementById("tbod").innerHTML = "";
    return;
  }

  // 2. Rechercher les produits correspondants
  for (let i = 0; i < dataProduct.length; i++) {
    if (
      dataProduct[i].title.toLowerCase().includes(value) ||
      dataProduct[i].category.toLowerCase().includes(value) ||
      dataProduct[i].reference === value
    ) {
      table += `
        <tr>
          <td class="data">${dataProduct[i].reference}</td>
          <td class="data">${dataProduct[i].title}</td>
          <td class="data">${dataProduct[i].category}</td>
          <td class="data">${dataProduct[i].count}</td>
          <td class="data">${dataProduct[i].price}</td>
          <td class="data">${dataProduct[i].discount}</td>
          <td class="data">${dataProduct[i].discountAmount}</td>
          <td class="data">${dataProduct[i].total}</td>
          <td><button onclick="saleProduct(${i})" id="saleNow-btn">Sale</button></td>
        </tr>
      `;
    }
  }

  // 3. Vérifier le résultat après la boucle
  if (table === "") {
    saleErrorMsg.classList.remove("hide");
    saleErrorMsg.classList.add("show");
    saleErrorMsg.innerHTML = "No product found";
    saleHeader.style.marginTop = "80px";
    saleTable.classList.remove("show");
    saleTable.classList.add("hide");
    document.getElementById("tbod").innerHTML = "";
  } else {
    saleErrorMsg.classList.remove("show");
    saleErrorMsg.classList.add("hide");
    saleErrorMsg.innerHTML = "";
    saleHeader.style.marginTop = "10px";
    saleTable.classList.remove("hide");
    saleTable.classList.add("show");
    document.getElementById("tbod").innerHTML = table;
  }
}

let I;

function saleProduct(i) {
  saleNowSection.classList.remove("hide");
  saleNowSection.classList.add("show");

  saleHeader.classList.remove("show");
  saleHeader.classList.add("hide");

  saleTable.classList.remove("show");
  saleTable.classList.add("hide");

  document.querySelector(".ref-resp").innerHTML = dataProduct[i].reference;
  document.querySelector(".title-resp").innerHTML = dataProduct[i].title;
  document.querySelector(".category-resp").innerHTML = dataProduct[i].category;
  document.querySelector(".count-resp").innerHTML = dataProduct[i].count;
  document.querySelector(".total-resp").innerHTML = dataProduct[i].total;

  document.getElementById("sale_img").classList.add("hide");
  I = i;
}

//sale products
async function saleNow(i) {
  const product = dataProduct[i];

  if (!product) {
    showNotification("Product not found!");
    saleNotification.classList.add("error-notification");
    return;
  }

  const productId = product.id;
  const quantity = Number(selectSaleValue);

  if (!Number.isInteger(quantity) || !quantity) {
    showNotification("Please select the number of products to sell");
    saleNotification.classList.add("error-notification");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}/sale`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to complete the sale.");
    }

    // Reload products from MySQL
    await loadProducts();

    // Get the updated product
    const updatedProduct = dataProduct.find((p) => p.id === productId);

    if (updatedProduct) {
      document.querySelector(".ref-resp").textContent =
        updatedProduct.reference;

      document.querySelector(".title-resp").textContent = updatedProduct.title;

      document.querySelector(".category-resp").textContent =
        updatedProduct.category;

      document.querySelector(".count-resp").textContent = updatedProduct.count;

      document.querySelector(".total-resp").textContent = updatedProduct.total;
    }

    showNotification(
      `${quantity} ${product.title} ${product.category} sold successfully`,
    );

    saleNotification.classList.remove("error-notification");

    setTimeout(() => {
      showSaleSection();
      document.getElementById("sale_img").classList.remove("hide");
    }, 3000);
  } catch (error) {
    console.error("Sale error:", error);
    showNotification(error.message || "Error completing the sale");
    saleNotification.classList.add("error-notification");
  }
}

saleCancelBtn.addEventListener("click", () => {
  saleNowSection.classList.add("hide");
  saleNowSection.classList.remove("show");

  saleHeader.classList.add("show");
  saleHeader.classList.remove("hide");

  saleTable.classList.add("show");
  saleTable.classList.remove("hide");

  document.querySelector(".sale-amount-display").innerHTML = "";
  document.querySelector(".tax").innerHTML = "";
  document.querySelector(".sale-taxes-display").innerHTML = "";
  document.querySelector(".net").innerHTML = "";
  document.querySelector(".sale-net-display").innerHTML = "";

  clearSaleData();
});

let selectSaleValue;
saleSelect.addEventListener("change", () => {
  let saleTotal = parsePrice(dataProduct[I].total);
  let saleValue = saleSelect.value;
  let saleTotalDispaly = saleTotal * saleValue;

  if (saleValue != 0) {
    document.querySelector(".sale-count-display").innerHTML =
      `${saleSelect.value} ${dataProduct[I].title} ${dataProduct[I].category} will be saled`;
    document.querySelector(".stat").innerHTML = "Total Amount:";
    document.querySelector(".sale-amount-display").innerHTML =
      ` ${saleTotalDispaly.toLocaleString("fr-FR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })}`;
    document.querySelector(".tax").innerHTML = "Taxes 18%: ";
    document.querySelector(".sale-taxes-display").innerHTML = `${(
      saleTotalDispaly * 0.18
    ).toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
    document.querySelector(".net").innerHTML = "Net amount: ";
    document.querySelector(".sale-net-display").innerHTML = `${(
      saleTotalDispaly -
      saleTotalDispaly * 0.18
    ).toLocaleString("fr-FR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  } else {
    document.querySelector(".sale-count-display").innerHTML =
      "Please select the number of products to sale";
    document.querySelector(".stat").innerHTML = "";
    document.querySelector(".sale-amount-display").innerHTML = "";
    document.querySelector(".tax").innerHTML = "";
    document.querySelector(".sale-taxes-display").innerHTML = "";
    document.querySelector(".net").innerHTML = "";
    document.querySelector(".sale-net-display").innerHTML = "";
  }

  selectSaleValue = Number(saleValue);
});

function parsePrice(value) {
  return Number(
    String(value)
      .replace(/[ \u00A0 ]/g, "")
      .replace(",", "."),
  );
}

function clearSaleData() {
  document.querySelector(".sale-count-display").innerHTML = "";
  document.querySelector(".ref-resp").innerHTML = "";
  document.querySelector(".title-resp").innerHTML = "";
  document.querySelector(".category-resp").innerHTML = "";
  document.querySelector(".count-resp").innerHTML = "";
  document.querySelector(".total-resp").innerHTML = "";
  saleSelect.value = 0;
  document.querySelector(".stat").innerHTML = "";
  document.querySelector(".sale-amount-display").innerHTML = "";
}

//show landing page
function showHomeSection() {
  homeSection.classList.remove("hide");
  homeSection.classList.add("show");

  createSection.classList.remove("show");
  createSection.classList.add("hide");

  inventorySection.classList.remove("show");
  inventorySection.classList.add("hide");

  searchSection.classList.add("hide");
  searchSection.classList.remove("show");

  saleSection.classList.remove("show");
  saleSection.classList.add("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");
  clearSaleData();
  clearData();
}

//landing buttons
//show inventory section
function showInventorySection() {
  homeSection.classList.remove("show");
  homeSection.classList.add("hide");

  createSection.classList.remove("show");
  createSection.classList.add("hide");

  inventorySection.classList.remove("hide");
  inventorySection.classList.add("show");

  searchSection.classList.add("show");
  searchSection.classList.remove("hide");

  saleSection.classList.remove("show");
  saleSection.classList.add("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");

  clearSaleData();
}

//show create section
function showCreateSection() {
  homeSection.classList.remove("show");
  homeSection.classList.add("hide");

  createSection.classList.remove("hide");
  createSection.classList.add("show");

  inventorySection.classList.remove("show");
  inventorySection.classList.add("hide");

  searchSection.classList.add("hide");
  searchSection.classList.remove("show");

  saleSection.classList.remove("show");
  saleSection.classList.add("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");
  if (mood != "update") {
    cancelBtn.style.display = "none";
  }
  clearSaleData();
}

submit.addEventListener("click", () => {
  submit.style.background = "#295951";
});

//show sale section
function showSaleSection() {
  homeSection.classList.remove("show");
  homeSection.classList.add("hide");

  createSection.classList.remove("show");
  createSection.classList.add("hide");

  inventorySection.classList.remove("show");
  inventorySection.classList.add("hide");

  searchSection.classList.add("hide");
  searchSection.classList.remove("show");

  saleSection.classList.add("show");
  saleSection.classList.remove("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");

  saleHeader.classList.remove("hide");
  saleHeader.classList.add("show");
  document.getElementById("sale_img").classList.remove("hide");
  saleErrorMsg.classList.remove("show");
  saleErrorMsg.classList.add("hide");

  document.querySelector(".sale-amount-display").innerHTML = "";
  document.querySelector(".tax").innerHTML = "";
  document.querySelector(".sale-taxes-display").innerHTML = "";
  document.querySelector(".net").innerHTML = "";
  document.querySelector(".sale-net-display").innerHTML = "";
  clearSaleData();
}

landingCreateBtn.addEventListener("click", () => {
  homeSection.classList.remove("show");
  homeSection.classList.add("hide");

  createSection.classList.remove("hide");
  createSection.classList.add("show");

  inventorySection.classList.remove("show");
  inventorySection.classList.add("hide");

  searchSection.classList.add("hide");
  searchSection.classList.remove("show");

  saleSection.classList.remove("show");
  saleSection.classList.add("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");
  submit.style.background = "#295951";
  clearSaleData();
});

landingInventoryBtn.addEventListener("click", () => {
  homeSection.classList.remove("show");
  homeSection.classList.add("hide");

  createSection.classList.remove("show");
  createSection.classList.add("hide");

  inventorySection.classList.remove("hide");
  inventorySection.classList.add("show");

  searchSection.classList.add("show");
  searchSection.classList.remove("hide");

  saleSection.classList.remove("show");
  saleSection.classList.add("hide");

  saleNowSection.classList.remove("show");
  saleNowSection.classList.add("hide");
  clearSaleData();
});

createBtn.addEventListener("click", () => {
  mood != "update";
});

//sale listeners
saleBtn.addEventListener("click", () => {
  saleSearch(saleInput.value);
  saleInput.value = "";
  document.getElementById("sale_img").classList.add("hide");
  document.querySelector(".sale-amount-display").innerHTML = "";
  document.querySelector(".tax").innerHTML = "";
  document.querySelector(".sale-taxes-display").innerHTML = "";
  document.querySelector(".net").innerHTML = "";
  document.querySelector(".sale-net-display").innerHTML = "";
});

saleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saleSearch(saleInput.value);
    saleInput.value = "";
    document.getElementById("sale_img").classList.add("hide");
  }
});

//cancel listener
function cancel() {
  location.reload();
}


// AUTHENTICATION

const API_URL = "http://localhost:3000/api";

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const appSection = document.getElementById("app-section");

// Switch between login and register
document.getElementById("show-register").addEventListener("click", () => {
    loginSection.classList.add("hide");
    registerSection.classList.remove("hide");
});

document.getElementById("show-login").addEventListener("click", () => {
    registerSection.classList.add("hide");
    loginSection.classList.remove("hide");
});

// Registration
document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const message = document.getElementById("register-message");

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Registration failed.";
            return;
        }

        message.textContent = "Registration successful! Please log in.";
        document.getElementById("register-form").reset();

    } catch (error) {
        console.error("Registration error:", error);
        message.textContent = "Unable to contact the server.";
    }
});


// LOGIN
document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            return;
        }

        message.textContent = "";

        loginSection.classList.add("hide");
        registerSection.classList.add("hide");
        appSection.classList.remove("hide");

        // Load products after successful login
        await loadProducts();

        document.getElementById("login-form").reset();

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Unable to contact the server.";
    }
});

// CHECK EXISTING SESSION
async function checkSession() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            // No valid session: display login
            appSection.classList.add("hide");
            registerSection.classList.add("hide");
            loginSection.classList.remove("hide");
            return;
        }

        // A valid session exists: display the CRUD
        loginSection.classList.add("hide");
        registerSection.classList.add("hide");
        appSection.classList.remove("hide");

        await loadProducts();

    } catch (error) {
        console.error("Session verification error:", error);

        appSection.classList.add("hide");
        registerSection.classList.add("hide");
        loginSection.classList.remove("hide");
    }
}

checkSession();


// LOGOUT
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Logout failed:", data.message);
            showNotification("Unable to log out");
            return;
        }

        // Hide the CRUD and registration sections
        appSection.classList.add("hide");
        registerSection.classList.add("hide");

        // Display the login section
        loginSection.classList.remove("hide");

        // Clear the login form
        document.getElementById("login-form").reset();
        document.getElementById("login-message").textContent = "";

        showNotification("Logged out successfully");

    } catch (error) {
        console.error("Logout error:", error);
        showNotification("Unable to contact the server");
    }
});