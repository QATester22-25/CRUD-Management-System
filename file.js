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

const bodyContainer = document.querySelector(".container");
const createSection = document.getElementById("create-section");
const inventorySection = document.getElementById("inventory-section");
const homeSection = document.getElementById("home-section");
const searchSection = document.querySelector(".search");
const showCreate = document.getElementById("show-create");
const saleSection = document.getElementById("sale-section");
const saleTable = document.querySelector(".sale-table");

const errorRef = document.getElementById("ref");
const errorCount = document.getElementById("count-error");
const errorPrice = document.getElementById("price-error");
const createNotification = document.getElementById("create-notification");
const inventoryNotification = document.getElementById("inventory-notification");

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
    total.style.background = "rgb(88, 12, 12)";

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
          console.log("mood: " + mood);
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
  submit.style.background = "#2d5382";
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
  count.style.display = "none";

  //change create button to update
  submit.innerHTML = "Update";

  tmp = i;

  getDiscount();
  getTotal();

  mood = "update";

  cancelBtn.style.display = "block";
  submit.style.background = "rgb(147, 100, 147)";
  totalTitle.innerText = "";
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
  document.getElementById('tbod').innerHTML = table;
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
  submit.style.background = "#2d5382";

  setTimeout(() => {
    createNotification.classList.remove("show");
    inventoryNotification.classList.remove("show");
  }, 5000);
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
    document.getElementById("tbody").innerHTML = table;
  }
}

searchBtn.addEventListener("click", () => {
  if (inputSearch.value) {
    searchProduct(inputSearch.value);
    deleteAllBtn.classList.add("delete-all-hide");
    inputSearch.value = "";
  } else {
    deleteAllBtn.classList.remove("delete-all-hide");
    showProductData();
  }
});

inputSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter")
    if (inputSearch.value) {
      searchProduct(inputSearch.value);
      deleteAllBtn.classList.add("delete-all-hide");
      inputSearch.value = "";
    } else {
      deleteAllBtn.classList.remove("delete-all-hide");
      showProductData();
    }
});


//JavaScript SPA router

//Nav buttons
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
}

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
}



//sale search
function saleSearch(value) {
  let table = "";
  for (let i = 0; i < dataProduct.length; i++){ 
    if (dataProduct[i].reference.includes(value) ||
      dataProduct[i].title.includes(value.toLowerCase()) ||
      dataProduct[i].category.includes(value.toLowerCase())
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
         <td><button>Sale</button></td> 
        </tr>
           `;
      
    }
  }
  document.getElementById("tbod").innerHTML = table;  
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

});

createBtn.addEventListener("click", () => {
  mood = "create";
});



//sale listeners
saleBtn.addEventListener('click', () => {
  if (saleInput.value != "") {
    saleSearch(saleInput.value);
    saleInput.value = "";
     saleSection.classList.remove("hide");
     saleSection.classList.add("show");
     saleTable.style.display = "block";
    
  } else {
    saleTable.style.display = "none";
  }
})

saleInput.addEventListener('keydown', (event) => {

  if (event.key === "Enter")
  if (saleInput.value != "") {
    saleSearch(saleInput.value);
    inputSearch.value = "";
     saleSection.classList.remove("hide");
     saleSection.classList.add("show");
     saleTable.style.display = "block";
  } else {
    saleTable.style.display = "none";
  }
})

//cancel listener
function cancel() {
  location.reload();
}
