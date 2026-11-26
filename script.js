/* North Star Bakery - script.js
   This file has 2 features:
   1. Pre-Order List Builder (products.html)
   2. Form validation + pre-filled items (contact.html)
   The list is saved in localStorage so it stays when you change pages. */


/* ========== DATA (arrays and objects) ========== */

// The place in localStorage where we save the list
var STORAGE_KEY = "northStarList";

// Array of category names for the filter menu
var categories = ["All", "Breads", "Pastries", "Cakes"];

// Array of product objects. Low and high are the price range in dollars.
var products = [
  { id: 1, name: "Signature Loaf", category: "Breads", low: 8, high: 10 },
  { id: 2, name: "Country Loaf", category: "Breads", low: 6, high: 8 },
  { id: 3, name: "Baguette", category: "Breads", low: 6, high: 7 },
  { id: 4, name: "Butter Croissant", category: "Pastries", low: 3, high: 4 },
  { id: 5, name: "Cinnamon Roll", category: "Pastries", low: 4, high: 6 },
  { id: 6, name: "Cookie and Pastry Box", category: "Pastries", low: 18, high: 30 },
  { id: 7, name: "Small Celebration Cake", category: "Cakes", low: 30, high: 45 },
  { id: 8, name: "Birthday Cake", category: "Cakes", low: 40, high: 90 },
  { id: 9, name: "Cupcakes (one dozen)", category: "Cakes", low: 24, high: 40 }
];

// Which category is showing right now
var currentCategory = "All";


/* ========== STORAGE FUNCTIONS ========== */

// Get the saved list (an array of product ids) from localStorage
function getSavedList() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return [];
  }
  try {
    var list = JSON.parse(saved);
    if (Array.isArray(list)) {
      return list;
    }
  } catch (error) {
    // the saved text was broken, so we start with an empty list
  }
  return [];
}

// Save the list into localStorage
function saveList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Delete the saved list
function clearSavedList() {
  localStorage.removeItem(STORAGE_KEY);
}


/* ========== LIST FUNCTIONS ========== */

// Find a product object by its id
function findProduct(id) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      return products[i];
    }
  }
  return null;
}

// Is this product already in the list?
function isInList(id) {
  return getSavedList().indexOf(id) !== -1;
}

// Make the price text, like "$8 to $10"
function priceText(product) {
  return "$" + product.low + " to $" + product.high;
}

// Add the product if it is not in the list. Remove it if it is.
function toggleItem(id) {
  var list = getSavedList();
  var product = findProduct(id);
  var message = "";

  if (list.indexOf(id) === -1) {
    list.push(id);
    message = "Added " + product.name + " to your list.";
  } else {
    list.splice(list.indexOf(id), 1);
    message = "Removed " + product.name + " from your list.";
  }

  saveList(list);
  showProducts();
  showMyList();
  showListMessage(message);

  // put the keyboard focus back on the button that was clicked
  var button = document.querySelector('button[data-id="' + id + '"]');
  if (button) {
    button.focus();
  }
}

// Add up the low prices and the high prices
function getTotals(list) {
  var low = 0;
  var high = 0;
  for (var i = 0; i < list.length; i++) {
    var product = findProduct(list[i]);
    if (product) {
      low = low + product.low;
      high = high + product.high;
    }
  }
  return { low: low, high: high };
}


/* ========== PRODUCTS PAGE FUNCTIONS ========== */

// Fill the category menu using the categories array
function fillCategoryMenu() {
  var menu = document.getElementById("category-filter");
  for (var i = 0; i < categories.length; i++) {
    var option = document.createElement("option");
    option.value = categories[i];
    option.textContent = categories[i];
    menu.appendChild(option);
  }
}

// Make one product row (a list item with a button)
function makeProductRow(product) {
  var item = document.createElement("li");
  item.className = "product-item";

  var info = document.createElement("div");
  var name = document.createElement("strong");
  name.textContent = product.name;
  var details = document.createElement("span");
  details.textContent = product.category + " - " + priceText(product);
  info.appendChild(name);
  info.appendChild(document.createElement("br"));
  info.appendChild(details);

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("data-id", product.id);

  if (isInList(product.id)) {
    button.textContent = "Remove";
    button.className = "selected";
    button.setAttribute("aria-label", "Remove " + product.name + " from my list");
  } else {
    button.textContent = "Add to List";
    button.setAttribute("aria-label", "Add " + product.name + " to my list");
  }

  button.addEventListener("click", function () {
    toggleItem(product.id);
  });

  item.appendChild(info);
  item.appendChild(button);
  return item;
}

// Show the products that match the chosen category
function showProducts() {
  var listElement = document.getElementById("product-list");
  listElement.innerHTML = "";

  for (var i = 0; i < products.length; i++) {
    var product = products[i];
    if (currentCategory === "All" || product.category === currentCategory) {
      listElement.appendChild(makeProductRow(product));
    }
  }
}

// Show "My Pre-Order List" with the count and estimated total
function showMyList() {
  var list = getSavedList();
  var listElement = document.getElementById("my-list");
  var totalElement = document.getElementById("list-total");
  listElement.innerHTML = "";

  document.getElementById("list-count").textContent = list.length;

  if (list.length === 0) {
    var empty = document.createElement("li");
    empty.textContent = "Your list is empty. Press Add to List on any item.";
    listElement.appendChild(empty);
    totalElement.textContent = "";
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var product = findProduct(list[i]);
    if (product) {
      var item = document.createElement("li");
      item.textContent = product.name + " (" + priceText(product) + ")";
      listElement.appendChild(item);
    }
  }

  var totals = getTotals(list);
  totalElement.textContent = "Estimated total: $" + totals.low + " to $" + totals.high;
}

// Show a short message for screen readers and sighted users
function showListMessage(text) {
  document.getElementById("list-message").textContent = text;
}

// Runs when the user changes the category menu
function handleFilterChange(event) {
  currentCategory = event.target.value;
  showProducts();
}

// Runs when the user presses "Clear My List"
function handleClearClick() {
  clearSavedList();
  showProducts();
  showMyList();
  showListMessage("Your list is now empty.");
}

// Start the products page
function setupProductsPage() {
  fillCategoryMenu();
  showProducts();
  showMyList();
  document.getElementById("category-filter").addEventListener("change", handleFilterChange);
  document.getElementById("clear-list").addEventListener("click", handleClearClick);
}


/* ========== CONTACT PAGE: PRE-FILL ========== */

// Turn the saved list into text for the "Item details" box
function makeDetailsText(list) {
  var lines = [];
  for (var i = 0; i < list.length; i++) {
    var product = findProduct(list[i]);
    if (product) {
      lines.push("- " + product.name);
    }
  }
  return lines.join("\n");
}

// Fill the "Item details" box with the saved list (only if it is empty)
function fillDetailsFromList() {
  var list = getSavedList();
  var notice = document.getElementById("list-notice");
  var details = document.getElementById("details");

  if (list.length === 0) {
    notice.textContent = "";
    return;
  }

  if (details.value.trim() === "") {
    details.value = makeDetailsText(list);
  }
  notice.textContent = "We added the " + list.length + " item(s) from your pre-order list. You can change them below.";
}


/* ========== CONTACT PAGE: VALIDATION ========== */

// Each object describes one field and the rule that checks it.
// The check function returns an error message, or "" if the field is OK.
var formFields = [
  {
    id: "name",
    check: function (value) {
      if (value.trim() === "") {
        return "Please type your name.";
      }
      if (value.trim().length < 2) {
        return "Your name must have at least 2 letters.";
      }
      if (/\d/.test(value)) {
        return "Your name cannot have numbers.";
      }
      return "";
    }
  },
  {
    id: "email",
    check: function (value) {
      if (value.trim() === "") {
        return "Please type your email.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Please type a real email, like name@example.com.";
      }
      return "";
    }
  },
  {
    id: "pickup",
    check: function (value) {
      if (value === "") {
        return "Please choose a pickup date.";
      }
      if (value < getTodayText()) {
        return "The pickup date cannot be in the past.";
      }
      return "";
    }
  },
  {
    id: "request-type",
    check: function (value) {
      if (value === "") {
        return "Please choose a request type.";
      }
      return "";
    }
  },
  {
    id: "details",
    check: function (value) {
      if (value.trim() === "") {
        return "Please tell us what you would like.";
      }
      if (value.trim().length < 5) {
        return "Please write at least 5 characters.";
      }
      if (value.length > 500) {
        return "Please use 500 characters or less. You have " + value.length + ".";
      }
      return "";
    }
  },
  {
    id: "allergies",
    check: function (value) {
      if (value.length > 300) {
        return "Please use 300 characters or less. You have " + value.length + ".";
      }
      return "";
    }
  }
];

// Today's date as text like "2026-11-26" (the same format as the date box)
function getTodayText() {
  var today = new Date();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  return today.getFullYear() + "-" + month + "-" + day;
}

// Show an error message next to a field
function showError(field, message) {
  var input = document.getElementById(field.id);
  var errorBox = document.getElementById(field.id + "-error");
  errorBox.textContent = message;
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
}

// Remove the error message from a field
function clearError(field) {
  var input = document.getElementById(field.id);
  var errorBox = document.getElementById(field.id + "-error");
  errorBox.textContent = "";
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
}

// Check one field. Returns true if it is OK.
function validateField(field) {
  var value = document.getElementById(field.id).value;
  var message = field.check(value);

  if (message === "") {
    clearError(field);
    return true;
  }
  showError(field, message);
  return false;
}

// Check every field. Returns true only if all are OK.
function validateForm() {
  var allGood = true;
  var firstBad = null;

  for (var i = 0; i < formFields.length; i++) {
    if (!validateField(formFields[i])) {
      allGood = false;
      if (firstBad === null) {
        firstBad = formFields[i];
      }
    }
  }

  // move the cursor to the first problem
  if (firstBad !== null) {
    document.getElementById(firstBad.id).focus();
  }
  return allGood;
}

// Runs when the user presses "Send My Request"
function handleSubmit(event) {
  event.preventDefault();   // stop the form from sending

  var message = document.getElementById("form-message");

  if (!validateForm()) {
    message.textContent = "Please fix the problems marked in the form and try again. Your answers are still here.";
    return;
  }

  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("email").value.trim();
  message.textContent = "Thank you, " + name + "! We got your request. We will email you at " + email + " within one day.";

  document.getElementById("order-form").reset();
  clearSavedList();
  document.getElementById("list-notice").textContent = "";
}

// Check a field again each time the user types or leaves it,
// so the error goes away as soon as it is fixed
function watchField(field) {
  var input = document.getElementById(field.id);
  input.addEventListener("blur", function () {
    validateField(field);
  });
  input.addEventListener("input", function () {
    // only re-check fields that already show an error
    if (input.classList.contains("invalid")) {
      validateField(field);
    }
  });
}

// Start the contact page
function setupContactPage() {
  // do not allow dates before today in the date picker
  document.getElementById("pickup").setAttribute("min", getTodayText());

  fillDetailsFromList();

  for (var i = 0; i < formFields.length; i++) {
    watchField(formFields[i]);
  }
  document.getElementById("order-form").addEventListener("submit", handleSubmit);
}


/* ========== START ========== */

// Only run the code for the page we are on
if (document.getElementById("product-list")) {
  setupProductsPage();
}
if (document.getElementById("order-form")) {
  setupContactPage();
}
