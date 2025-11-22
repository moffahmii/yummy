// ======= DOM Elements =======
const rowData = document.getElementById("rowData");
const searchContainer = document.getElementById("searchContainer");
const sideNav = document.querySelector(".side-nav-menu");
const openCloseIcon = document.querySelector(".open-close-icon");
const links = document.querySelectorAll(".links li");
const loadingScreen = document.querySelector(".loading-screen");
const innerLoadingScreen = document.querySelector(".inner-loading-screen");

// ======= Sidebar Functions =======
function toggleSideNav(open) {
    if (open) {
        sideNav.classList.add("open");
        openCloseIcon.classList.replace("fa-align-justify", "fa-x");
        links.forEach((li, i) => {
            li.style.transition = `${(i + 5) * 0.1}s`;
            li.style.top = "0px";
        });
    } else {
        sideNav.classList.remove("open");
        openCloseIcon.classList.replace("fa-x", "fa-align-justify");
        links.forEach(li => {
            li.style.transition = "0.5s";
            li.style.top = "300px";
        });
    }
}

openCloseIcon.addEventListener("click", () => {
    toggleSideNav(sideNav.classList.contains("open") ? false : true);
});

// ======= Utility Functions =======
function showLoading() {
    loadingScreen.style.display = "flex";
    innerLoadingScreen.style.display = "flex";
}

function hideLoading() {
    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 400); 
}


async function fetchAPI(url) {
    showLoading();
    const res = await fetch(url);
    const data = await res.json();
    hideLoading();
    return data;
}

// ======= Display Functions =======
function createMealsHTML(arr) {
    return arr.map(meal => `
        <div class="col-md-3">
            <div class="meal" data-id="${meal.idMeal}">
                <img class="w-100" src="${meal.strMealThumb}" alt="">
                <div class="meal-layer"><h3 class="fw-bold fs">${meal.strMeal}</h3></div>
            </div>
        </div>
    `).join('');
}

function createCategoriesHTML(arr) {
    return arr.map(cat => `
        <div class="col-md-3">
            <div class="meal" data-category="${cat.strCategory}">
                <img class="w-100" src="${cat.strCategoryThumb}" alt="">
                <div class="meal-layer text-center p-2">
                    <h3 class="d-block w-100">${cat.strCategory}</h3>
                    <p>${cat.strCategoryDescription.split(" ").slice(0, 20).join(" ")}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function createAreaHTML(arr) {
    return arr.map(area => `
        <div class="col-md-3">
            <div class="rounded-2 text-center cursor-pointer p-3 bg-white shadow" data-area="${area.strArea}">
                <i class="fa-solid fa-house-laptop fa-4x"></i>
                <h3>${area.strArea}</h3>
            </div>
        </div>
    `).join('');
}

function createIngredientsHTML(arr) {
    return arr.map(ing => `
        <div class="col-md-3">
            <div class="w-100 rounded-2 text-center text-white cursor-pointer p-3  shadow" data-ingredient="${ing.strIngredient}">
                <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                <h3>${ing.strIngredient}</h3>
                <p>${ing.strDescription?.split(" ").slice(0, 20).join(" ") || ""}</p>
            </div>
        </div>
    `).join('');
}

function attachMealClick(selector, callback, dataAttr) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener("click", () => callback(el.dataset[dataAttr]));
    });
}

function displayMeals(arr) {
    rowData.innerHTML = createMealsHTML(arr);
    attachMealClick(".meal", getMealDetails, "id");
}

function displayCategories(arr) {
    rowData.innerHTML = createCategoriesHTML(arr);
    attachMealClick(".meal", getCategoryMeals, "category");
}

function displayArea(arr) {
    rowData.innerHTML = createAreaHTML(arr);
    attachMealClick('[data-area]', getAreaMeals, "area");
}

function displayIngredients(arr) {
    rowData.innerHTML = createIngredientsHTML(arr);
    attachMealClick('[data-ingredient]', getIngredientsMeals, "ingredient");
}

// ======= Fetch & Display Abstraction =======
async function fetchAndDisplay(url, displayFunc, limit = false) {
    rowData.innerHTML = "";
    const data = await fetchAPI(url);
    let results = data.meals || data.categories || [];
    if (limit && results.length > 20) results = results.slice(0, 20);
    displayFunc(results);
}

// ======= Specific Fetch Functions =======
const getCategories = () => fetchAndDisplay("https://www.themealdb.com/api/json/v1/1/categories.php", displayCategories);
const getArea = () => fetchAndDisplay("https://www.themealdb.com/api/json/v1/1/list.php?a=list", displayArea);
const getIngredients = () => fetchAndDisplay("https://www.themealdb.com/api/json/v1/1/list.php?i=list", displayIngredients, true);
const getCategoryMeals = category => fetchAndDisplay(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`, displayMeals, true);
const getAreaMeals = area => fetchAndDisplay(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`, displayMeals, true);
const getIngredientsMeals = ing => fetchAndDisplay(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ing}`, displayMeals, true);
const searchByName = term => fetchAndDisplay(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`, displayMeals);
const searchByFLetter = term => fetchAndDisplay(`https://www.themealdb.com/api/json/v1/1/search.php?f=${term || "a"}`, displayMeals);

// ======= Display Meal Details =======
function displayMealDetails(meal) {
    const ingredients = Array.from({ length: 20 }, (_, i) => {
        const ing = meal[`strIngredient${i + 1}`];
        return ing ? `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i + 1}`]} ${ing}</li>` : "";
    }).join('');
    const tags = (meal.strTags?.split(",") || []).map(t => `<li class="alert alert-danger m-2 p-1">${t}</li>`).join('');
    rowData.innerHTML = `
    <div class="col-md-4">
        <h2 class="text-center fw-bold text-white py-2">${meal.strMeal}</h2>
        <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="">
    </div>
    <div class="col-md-8 text-white">
        <h2>Instructions</h2>
        <p>${meal.strInstructions}</p>
        <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
        <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
        <h3>Recipes:</h3>
        <ul class="list-unstyled d-flex flex-wrap g-3">${ingredients}</ul>
        <h3 class="fw-bold">Tags :</h3>
        <ul class="list-unstyled d-flex flex-wrap g-3">${tags}</ul>
        <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
        <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
    </div>`;
}

async function getMealDetails(id) {
    rowData.innerHTML = "";
    const data = await fetchAPI(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    displayMealDetails(data.meals[0]);
}

// ======= Search Inputs =======
function showSearchInputs() {
    searchContainer.innerHTML = `
    <div class="row py-4">
        <div class="col-md-6">
            <input id="searchName" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
        </div>
        <div class="col-md-6">
            <input id="searchLetter" maxlength="1" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
        </div>
    </div>`;
    rowData.innerHTML = "";
    document.getElementById("searchName").addEventListener("keyup", e => searchByName(e.target.value));
    document.getElementById("searchLetter").addEventListener("keyup", e => searchByFLetter(e.target.value));
}

// ======= Sidebar Link Events =======
links.forEach(li => {
    li.addEventListener("click", () => {
        const action = li.dataset.action;
        switch (action) {
            case "search": showSearchInputs(); break;
            case "categories": getCategories(); break;
            case "area": getArea(); break;
            case "ingredients": getIngredients(); break;
            case "contact": showContacts?.(); break;
        }
        toggleSideNav(false);
    });
});

// ======= Initial Load =======
document.addEventListener("DOMContentLoaded", () => {
    searchByName("");
});
hideLoading();

// ======= Contact Form =======
function showContacts() {
    rowData.innerHTML = `
    <div class="contact min-vh-100 d-flex justify-content-center align-items-center">
        <div class="container w-75 text-center">
            <div class="row g-4">
                ${[
            { id: "nameInput", placeholder: "Enter Your Name", alert: "Special characters and numbers not allowed" },
            { id: "emailInput", placeholder: "Enter Your Email", alert: "Email not valid *example@yyy.zzz" },
            { id: "phoneInput", placeholder: "Enter Your Phone", alert: "Enter valid Phone Number" },
            { id: "ageInput", placeholder: "Enter Your Age", alert: "Enter valid age" },
            { id: "passwordInput", placeholder: "Enter Your Password", alert: "Enter valid password *Minimum eight characters, at least one letter and one number*" },
            { id: "repasswordInput", placeholder: "Repassword", alert: "Passwords do not match" }
        ].map(f => `
                    <div class="col-md-6">
                        <input id="${f.id}" type="${f.id.includes('password') ? 'password' : f.id === 'ageInput' ? 'number' : f.id === 'emailInput' ? 'email' : 'text'}" class="form-control" placeholder="${f.placeholder}">
                        <div id="${f.id.replace('Input', 'Alert')}" class="alert alert-danger w-100 mt-2 d-none">${f.alert}</div>
                    </div>
                `).join('')}
            </div>
            <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3">Submit</button>
        </div>
    </div>`;

    const inputs = ["nameInput", "emailInput", "phoneInput", "ageInput", "passwordInput", "repasswordInput"];
    const regexes = {
        nameInput: /^[a-zA-Z\s]{2,}$/,
        emailInput: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneInput: /^[0-9]{10,14}$/,
        ageInput: /^(?:1[89]|[2-9]\d)$/,
        passwordInput: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    };

    const touched = Object.fromEntries(inputs.map(id => [id, false]));
    const submitBtn = document.getElementById("submitBtn");

    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener("focus", () => touched[id] = true);
        el.addEventListener("keyup", validate);
    });

    function validate() {
        const values = Object.fromEntries(inputs.map(id => [id, document.getElementById(id).value.trim()]));
        const isValid = {
            nameInput: regexes.nameInput.test(values.nameInput),
            emailInput: regexes.emailInput.test(values.emailInput),
            phoneInput: regexes.phoneInput.test(values.phoneInput),
            ageInput: regexes.ageInput.test(values.ageInput),
            passwordInput: regexes.passwordInput.test(values.passwordInput),
            repasswordInput: values.passwordInput === values.repasswordInput && values.repasswordInput !== ""
        };
        Object.keys(isValid).forEach(id => {
            document.getElementById(id.replace('Input', 'Alert')).classList.toggle("d-none", isValid[id] || !touched[id]);
        });
        submitBtn.disabled = !Object.values(isValid).every(v => v);
    }
}
