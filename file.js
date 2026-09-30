let managementSection = document.querySelector(".left");
let inventorySection = document.querySelector(".right");
let errorRef = document.getElementById("ref");
let errorCount = document.getElementById("count-error");
let errorPrice = document.getElementById("price-error");
let reference = document.getElementById("reference");
let title = document.getElementById("title");
let price = document.getElementById("price");
let discount = document.getElementById("discount");
let discountAmount = document.querySelector(".discount-amount");
let amountSpan = document.querySelector(".span");
let total = document.getElementById("total");
let count = document.getElementById("count");
let category = document.getElementById("category");
let submit = document.getElementById("submit");
let deleteAllBtn = document.getElementById("delete-all");
let countLabel = document.querySelector(".count-label");
let totalTitle = document.querySelector(".total-title");
let showInventory = document.getElementById("show-inventory");
let showCreate = document.getElementById("show-create");
let notification = document.getElementById("notification");
let inventoryNotification = document.getElementById("inventory-notification");

price.addEventListener("blur", () => {
  if (price.value !== "") {
    price.value = Number(price.value).toFixed(3);
  }
});

function showInventoryTable() {
  showInventory.addEventListener("click", () => {
    managementSection.classList.add("hide");
    inventorySection.classList.add("show");
  });
}
showInventoryTable();

function showCreatePage() {
  showCreate.addEventListener("click", () => {
    managementSection.classList.remove("hide");
    inventorySection.classList.remove("show");
  });
}
showCreatePage();


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
////////////////////1- Calculate discount  -//////////////////////////

//initialize empty variable;
let rate;

function getDiscount() {
  const select = discount;
  let index = select.selectedIndex;
  selectedValue = select.options[index].value;
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
  let newPrice = price.value - convertedDiscount;
  rate = newPrice;
  getTotal();
}

//initialize mood
let mood = "create";

//initialize empty variable;
let tmp;

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
    total.style.background = "rgb(51, 88, 127)";

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

// product in local storage
if (localStorage.product != null) {
  dataProduct = JSON.parse(localStorage.product);

  // local storage empty
} else {
  dataProduct = [];
}

//////////////// 3- Submit for Create / Update product - ////////////////////////////
submit.onclick = function () {
  //declare product object
  let newProduct = {
    reference: reference.value,
    title: title.value,
    category: category.value,
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
      //check reference
      let refer = document.getElementById("reference").value;
      let data = JSON.parse(localStorage.getItem("product")) || [];
      let existsRef = data.some((product) => product.reference === refer);

      //same reference
      if (existsRef) {
        errorRef.classList.add("ref-error");
        errorRef.innerText =
          "This Reference already exists, please try another!";
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

          notification.classList.remove("error-notification");
          showNotification("Product created successfully");
          window.scrollTo({
            bottom: 0,
            behavior: "smooth",
          });

          errorRef.classList.remove("ref-error");
          errorRef.innerText = "";
          totalTitle.innerText = "";

          //display inventory section

          setTimeout(() => {
            managementSection.classList.add("hide");
            inventorySection.classList.add("show");
          }, 2000);

          //Catch error
        } catch (error) {
          showNotification("An error has occured");
          window.scrollTo({
            bottom: 0,
            behavior: "smooth",
          });

          console.log(error.message);
        }
      }
    } else {
      mood != " create";

      //display inventory section after update
      setTimeout(() => {
        managementSection.classList.add("hide");
        inventorySection.classList.add("show");
      }, 2000);

      //////////////////Update product///////////////////////////////////
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
          mood = "update";

          submit.innerHTML = "Create";
          count.removeAttribute("disabled", "");

          //save product in localstorage
          localStorage.setItem("product", JSON.stringify(dataProduct));
          count.style.display = "block";
          totalTitle.innerText = " ";

          showProductData();
          clearData();

          notification.classList.remove("error-notification");
          showNotification("Updated successfully");

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

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
  total.style.background = "gray";
  errorCount.innerText = "";
  errorPrice.innerText = "";
  total.classList.remove("total");
}

//Read - show products
function showProductData() {
  let table = "";
  for (let i = 0; i < dataProduct.length; i++) {
    table += `<tr>
        <td class="data">${dataProduct[i].reference}</td>
        <td class="data" >${dataProduct[i].title}</td>
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
        <td><button onclick="updateProduct(${i})" id="update">update</button></td>
        <td><button onclick="deleteProduct(${i})" id="delete">delete</button></td>
      </tr>`;

    //add deleteAll button if there's at list one product
    if (dataProduct.length) {
      deleteAllBtn.innerHTML = `<button  onclick="deleteAll()" id="deleteAll">Delete All (${dataProduct.length})</button>`;
    }
  }

  //add products to the table
  document.getElementById("tbody").innerHTML = table;
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
   notification.classList.add("error-notification");
  //window scroll
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

//delete All
function deleteAll() {
  localStorage.clear();
  dataProduct.splice(0);
  deleteAllBtn.innerHTML = "";
  showProductData();
  //notification
  showNotification("All products has been deleted");
  notification.classList.add("error-notification");
  //window scroll
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

  //display product management to update data
  managementSection.classList.remove("hide");
  inventorySection.classList.remove("show");

  //hide count input and label
  count.style.display = "none";
  //countLabel.style.display = "none";

  //change create button to update
  submit.innerHTML = "Update";

  tmp = i;
  getDiscount();
  getTotal();

  mood = "update";

  submit.style.background = "rgb(147, 100, 147)";
  totalTitle.innerText = "";
}

//Notification
function showNotification(message) {
  

  notification.innerText = message;
  notification.classList.add("show");
  submit.style.background = "#59ac87";

  setTimeout(() => {
    notification.classList.remove("show");
  }, 5000);
}

//search
//clean data
