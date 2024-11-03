import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, set, remove, get, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn7ulbwImBHHkSO_4DYpBAfKZCYDhuAqg",
    authDomain: "app-dokan.firebaseapp.com",
    databaseURL: "https://app-dokan-default-rtdb.firebaseio.com",
    projectId: "app-dokan",
    storageBucket: "app-dokan.appspot.com",
    messagingSenderId: "388747703289",
    appId: "1:388747703289:web:162085a1c25790bd954328"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const categoryInput = document.getElementById('category-name');
const addCategoryButton = document.getElementById('add-category');
const deleteCategoryInput = document.getElementById('delete-category-name');
const deleteCategoryButton = document.getElementById('delete-category');
const productCategorySelect = document.getElementById('product-category');
const productTitleInput = document.getElementById('product-title');
const productPriceInput = document.getElementById('product-price');
const productStockInput = document.getElementById('product-stock');
const productImageInput = document.getElementById('product-image');
const productLinkInput = document.getElementById('product-link');
const addProductButton = document.getElementById('add-product');
const productSelect = document.getElementById('product-select');
const editProductTitleInput = document.getElementById('edit-product-title');
const editProductPriceInput = document.getElementById('edit-product-price');
const editProductStockInput = document.getElementById('edit-product-stock');
const editProductImageInput = document.getElementById('edit-product-image');
const editProductLinkInput = document.getElementById('edit-product-link');
const editProductButton = document.getElementById('edit-product');

// Load categories and products
async function loadCategories() {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, 'product'));
        if (snapshot.exists()) {
            const categories = Object.keys(snapshot.val());
            productCategorySelect.innerHTML = '';
            productSelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.innerText = category;
                productCategorySelect.appendChild(option);
            });
            loadProducts(categories[0]); // Load products for the first category
        }
    } catch (error) {
        console.error("Error loading categories: ", error);
    }
}

// Load products for the selected category
async function loadProducts(category) {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, `product/${category}`));
        if (snapshot.exists()) {
            productSelect.innerHTML = '';
            const products = Object.keys(snapshot.val());
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product;
                option.innerText = product;
                productSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error loading products: ", error);
    }
}

// Add a new category
addCategoryButton.addEventListener('click', async () => {
    const categoryName = categoryInput.value.trim();
    if (categoryName) {
        const dbRef = ref(database, `product/${categoryName}`);
        await set(dbRef, {});
        categoryInput.value = '';
        loadCategories();
    } else {
        alert("Please enter a category name.");
    }
});

// Delete a category
deleteCategoryButton.addEventListener('click', async () => {
    const categoryName = deleteCategoryInput.value.trim();
    if (categoryName) {
        const dbRef = ref(database, `product/${categoryName}`);
        await remove(dbRef);
        deleteCategoryInput.value = '';
        loadCategories();
    } else {
        alert("Please enter a category name.");
    }
});

// Add a product to the selected category
addProductButton.addEventListener('click', async () => {
    const category = productCategorySelect.value;
    const title = productTitleInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const stoke = parseInt(productStockInput.value);
    const image1 = productImageInput.value.trim(); // Use only image name here
    const info = productLinkInput.value.trim();

    if (category && title && !isNaN(price) && !isNaN(stoke) && image1 && info) {
        const dbRef = ref(database, `product/${category}/${title}`);
        await set(dbRef, { 
            title, 
            price, 
            stoke, 
            images: { image1 },  // Store image URL in images/image1
            info 
        });
        productTitleInput.value = '';
        productPriceInput.value = '';
        productStockInput.value = '';
        productImageInput.value = '';
        productLinkInput.value = '';
        alert("Product added successfully.");
        loadProducts(category); // Reload products for the current category
    } else {
        alert("Please fill out all fields correctly.");
    }
});

// Load products for the selected category when the dropdown changes
productCategorySelect.addEventListener('change', (e) => {
    loadProducts(e.target.value);
});

// Populate edit fields when a product is selected
productSelect.addEventListener('change', async (e) => {
    const selectedProduct = e.target.value;
    const category = productCategorySelect.value;

    const dbRef = ref(database, `product/${category}/${selectedProduct}`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        const productData = snapshot.val();
        editProductTitleInput.value = productData.title;
        editProductPriceInput.value = productData.price;
        editProductStockInput.value = productData.stoke; // Updated to `stoke`
        editProductImageInput.value = productData.images.image1; // Access image from images/image1
        editProductLinkInput.value = productData.info; // Updated to `info`
    }
});

// Update a product
editProductButton.addEventListener('click', async () => {
    const category = productCategorySelect.value;
    const selectedProduct = productSelect.value;
    const newTitle = editProductTitleInput.value.trim();
    const newPrice = parseFloat(editProductPriceInput.value);
    const newStoke = parseInt(editProductStockInput.value);
    const newImage1 = editProductImageInput.value.trim(); // Only image name
    const newInfo = editProductLinkInput.value.trim();

    if (selectedProduct) {
        const dbRef = ref(database, `product/${category}/${selectedProduct}`);
        await set(dbRef, { 
            title: newTitle, 
            price: newPrice, 
            stoke: newStoke,
            images: { image1: newImage1 }, // Store updated image in images/image1
            info: newInfo 
        });
        editProductTitleInput.value = '';
        editProductPriceInput.value = '';
        editProductStockInput.value = '';
        editProductImageInput.value = '';
        editProductLinkInput.value = '';
        alert("Product updated successfully.");
        loadProducts(category); // Reload products to refresh the dropdown
    } else {
        alert("Please select a product to update.");
    }
});

// Initialize the control panel
loadCategories();
