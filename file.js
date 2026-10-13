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
const saleNotification = document.getElementById('sale-notification');

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
  let index = select.selectedIndex;
  ///////////////////////////
  console.log(index);
  //////////////////////////
  let selectedValue = select.options[index].value;
  let t = selectedValue / 100;
  let convertedDiscount = price.value * t;

  if (price.value > 0 && discount.value > 0) {
    discountAmount.innerHTML = Number(convertedDiscount).toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      },
    );
  } else {
    discountAmount.innerHTML = "";
  }
  //price after discount
  let newPrice = price.value - convertedDiscount;

  rate = newPrice;

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

// If product in local storage
if (localStorage.product != null) {
  dataProduct = JSON.parse(localStorage.product);

  // local storage empty
} else {
  dataProduct = [];
}

//initialize empty variable;
let tmp;

//initialize mood
let mood = "create";

//////////////// 3- Submit for Create / Update product - ////////////////////////////
submit.onclick = function () {
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

  //price and count are not empty
  if (price.value > 0 && count.value > 0) {
    //////////////////////Create Product///////////////////////////////////////

    if (mood === "create") {
      cancelBtn.style.display = "none";
      //check reference
      let refer = document.getElementById("reference").value;
      let data = JSON.parse(localStorage.getItem("product")) || [];
      let existsRef = data.some((product) => product.reference === refer);

      //same reference
      if (existsRef) {
        errorRef.classList.add("ref-error");
        errorRef.innerText = "Reference already exists, please try another!";
        return;

        //reference doesn't exist
      } else {
        try {
          //push new product
          dataProduct.push(newProduct);

          //save product in localstorage
          localStorage.setItem("product", JSON.stringify(dataProduct));

          showProductData();
          clearData();

          createNotification.classList.remove("error-notification");
          showNotification("Product created successfully");

          errorRef.classList.remove("ref-error");
          errorRef.innerText = "";
          totalTitle.innerText = "";

          console.log("mood: " + mood);

          //Catch error
        } catch (error) {
          showNotification("An error has occured");
          console.log(error.message);
        }
      }
      //////else if mood is !create
    } else {
      //////////////////Update product///////////////////////////////////

      mood != "create";

      let refer = document.getElementById("reference").value.trim();
      let data = JSON.parse(localStorage.getItem("product")) || [];
      let existsRef = data.some(
        (product, index) => product.reference === refer && index !== tmp,
      );

      //Reference exits
      if (existsRef) {
        errorRef.classList.add("ref-error");
        errorRef.innerText =
          "This Reference already exists, please try another!";
        return;

        //Reference doesn't exits
      } else {
        try {
          errorRef.classList.remove("ref-error");
          errorRef.innerText = "";

          dataProduct[tmp] = newProduct;
          console.log(dataProduct[tmp]);
          mood = "update";
          console.log("I'm the product index in update mood " + tmp);
          submit.innerHTML = "Create";
          count.removeAttribute("disabled", "");

          //save product in localstorage
          localStorage.setItem("product", JSON.stringify(dataProduct));
          count.style.display = "block";
          totalTitle.innerText = "";
          showProductData();
          /////////////////////////////
          showInventorySection();
          /////////////////////////////////
          clearData();

          createNotification.classList.remove("error-notification");
          showNotification("Updated successfully");
          showInventorySection();
          //catch error
        } catch (error) {
          showNotification("An error has been occured");
          console.log(error.message);
        }
      }
    }
  } else if (!count.value && price.value > 0) {
    errorCount.innerText = "*";
    errorPrice.innerText = "";
    errorCount.classList.add("count-error");
  } else if (!price.value && !count.value) {
    errorPrice.innerText = "*";
    errorCount.innerText = "*";
    errorPrice.classList.add("price-error");
    errorCount.classList.add("count-error");
  } else {
    errorPrice.innerText = "*";
    errorCount.innerText = "";
    errorPrice.classList.add("price-error");
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
    if (dataProduct.length) {
      deleteAllBtn.innerHTML = `<button  onclick="deleteAll()" id="deleteAll">Delete All (${dataProduct.length})</button>`;
    }
  }

  //add products to the table
  document.getElementById("tbody").innerHTML = table;
  deleteAllBtn.classList.remove("delete-all-hide");
}

//call showProduct function
if (dataProduct.length) {
  showProductData();
}

//delete
function deleteProduct(i) {
  dataProduct = dataProduct.filter((product, index) => {
    return index !== i;
  });

  //update localstorage
  localStorage.product = JSON.stringify(dataProduct);
  showProductData();

  //notification
  showNotification("The product has been deleted");
  inventoryNotification.classList.add("error-notification");
  createNotification.classList.remove("error-notification");
}

//delete All
function deleteAll() {
  localStorage.clear();
  dataProduct.splice(0);
  deleteAllBtn.innerHTML = "";
  showProductData();
  //notification
  showNotification("All products has been deleted");
  createNotification.classList.add("error-notification");
}

//Update
function updateProduct(i) {
  //restore values to input fields
  reference.value = dataProduct[i].reference;
  title.value = dataProduct[i].title;
  category.value = dataProduct[i].category;
  price.value = dataProduct[i].price;
  discount.value = dataProduct[i].discount;
  count.value = dataProduct[i].count;

  //hide count input and label
 // count.style.display = "none";

  //change create button to update
  submit.innerHTML = "Update";
  cancelBtn.style.display = "block";
  tmp = i;

  getDiscount();
  getTotal();

  mood = "update";

  
  submit.style.background = "rgb(147, 100, 147)";
  totalTitle.innerText = "";
  document.querySelector(".price-discount-labels").style.marginTop = "0px";
  document.querySelector(".prod-mang-title").style.marginBottom = "5px";
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

//call sale function
if (dataProduct.length) {
  showSaleProduct();
}

//Notification
function showNotification(message) {
  createNotification.innerText = message;
  createNotification.classList.add("show");
  inventoryNotification.innerText = message;
  inventoryNotification.classList.add("show");
  saleNotification.innerHTML = message;
  saleNotification.classList.add('show');
  setTimeout(() => {
    createNotification.classList.remove("show");
    inventoryNotification.classList.remove("show");
    saleNotification.classList.remove('show');
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
    document.getElementById("table-body").classList.add('hide');
    document.querySelector(".no-products").classList.remove('hide');  
    document.querySelector(".no_products_img").classList.remove('hide');
  
    
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
    document.querySelector(".no-products").classList.add("hide");
    document.getElementById("table-body").classList.remove("hide");
    document.querySelector(".sale-img").classList.add("hide");
     document.querySelector(".no_products_img").classList.add("hide");
    showProductData();
  }
});

inputSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter")
    if (inputSearch.value.trim() != "") {
      searchProduct(inputSearch.value);
      deleteAllBtn.classList.add("delete-all-hide");
      inputSearch.value = "";
      document.getElementById("sale_img").classList.add('hide');
    } else {
      deleteAllBtn.classList.remove("delete-all-hide");
      document.querySelector(".no-products").classList.add("hide");
      document.getElementById("table-body").classList.remove("hide");
      document.getElementById("sale_img").classList.add("hide");
      document.querySelector(".no_products_img").classList.add("hide");
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

  document.querySelector('.ref-resp').innerHTML = dataProduct[i].reference;
  document.querySelector('.title-resp').innerHTML = dataProduct[i].title;
  document.querySelector('.category-resp').innerHTML = dataProduct[i].category;
  document.querySelector('.count-resp').innerHTML = dataProduct[i].count;
  document.querySelector('.total-resp').innerHTML = dataProduct[i].total;

  document.getElementById("sale_img").classList.add("hide");
    I = i;
}

function saleNow(I) {
  dataProduct = JSON.parse(localStorage.product);
  const countRemaining = dataProduct[I].count - Number(selectSaleValue);
  if (Number(selectSaleValue > 0)) {
    if (dataProduct[I].count > Number(selectSaleValue)) {
      dataProduct[I].count = countRemaining;
      localStorage.setItem("product", JSON.stringify(dataProduct));
      console.log(dataProduct[I].count);
      showNotification(
        `${saleSelect.value} ${dataProduct[I].title} ${dataProduct[I].category} have been saled`,
      );
      saleNotification.classList.remove("error-notification");

      document.querySelector(".ref-resp").innerHTML = dataProduct[I].reference;
      document.querySelector(".title-resp").innerHTML = dataProduct[I].title;
      document.querySelector(".category-resp").innerHTML =
        dataProduct[I].category;
      document.querySelector(".count-resp").innerHTML = dataProduct[I].count;
      document.querySelector(".total-resp").innerHTML = dataProduct[I].total;

      showProductData();
      setTimeout(() => {
        showSaleSection();
        document.getElementById('sale_img').classList.remove('hide');
      }, 3000);
    } else {
      showNotification("No enough products to sale!");
      saleNotification.classList.add("error-notification");
    }
  } else {
    showNotification("Please select the number of products to sale");
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

  clearSaleData();
});

let selectSaleValue;
saleSelect.addEventListener("change", () => {
  let saleTotal =
    parsePrice(dataProduct[I].total);
  let saleValue = saleSelect.value;
  let saleTotalDispaly = saleTotal * saleValue ;

  if (saleValue != 0) {
     document.querySelector(".sale-count-display").innerHTML =
       `${saleSelect.value} ${dataProduct[I].title} ${dataProduct[I].category} will be saled`;
     document.querySelector(".stat").innerHTML = "Total Amount: ";
     document.querySelector(".sale-amount-display").innerHTML =
       ` ${saleTotalDispaly.toLocaleString("fr-FR", {
         minimumFractionDigits: 3,
         maximumFractionDigits: 3,
       })}`;
  } else {
    document.querySelector(".sale-count-display").innerHTML =
      "Please select the number of products to sale";
      document.querySelector(".stat").innerHTML = "";
    document.querySelector(".sale-amount-display").innerHTML = "";
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
  document.querySelector('.sale-count-display').innerHTML = '';
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
  document.getElementById('sale_img').classList.remove('hide');

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

submit.addEventListener('click', () => {
  submit.style.background = "#295951";
})

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
  document.getElementById('sale_img').classList.remove('hide');
  saleErrorMsg.classList.remove('show');
  saleErrorMsg.classList.add('hide');
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
});

saleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saleSearch(saleInput.value);
    saleInput.value = "";
    console.log("this is the keydown listener");
    document.getElementById('sale_img').classList.add('hide');
  }
});

//cancel listener
function cancel() {
  location.reload();
}
