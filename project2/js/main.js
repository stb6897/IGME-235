//#region Variables

let breedOptions = document.querySelector('#breed');
let subBreedOptions = document.querySelector('#sub_breed');
let amountOptions = document.querySelector('#amount');

let randomImage = document.querySelector('#randomizer_image');
let randomButton = document.querySelector('#randomizer_button');

let searchButton = document.querySelector('#search_button');

let dogBreed = document.querySelector('#dog_breed');
let mainImage = document.querySelector('#main_image');
let content = document.querySelector('#content');
let breeds = new Array();

//#endregion
//#region General Helper Functions
function httpGetResult(url, method) {
    // Sets the breed text to loading so the user knows.
    dogBreed.innerHTML = "Loading Image";

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url);
    xmlHttp.send();
    xmlHttp.onload = method;
}
function SetBreeds(e) {
    breeds = JSON.parse(e.target.responseText).message;

    // Loops through all the breeds the api gives us and adds them as options.
    for (let key in breeds) {
        let option = document.createElement('option');
        option.value = key;
        option.innerHTML = key;
        if (possibleBreed && option.value == possibleBreed) {
            option.selected = true;
        }
        breedOptions.appendChild(option);
    }
}
function SetSubBreeds() {
    // Removes previous sub breeds and adds the new ones based on the current selected breed.
    while (subBreedOptions.lastChild.value != "none") {
        subBreedOptions.removeChild(subBreedOptions.lastChild);
    }

    let subBreeds = breeds[breedOptions.value];
    if (subBreeds && subBreeds.length > 0) {
        for (let key in subBreeds) {
            let option = document.createElement('option');
            option.value = subBreeds[key];
            option.innerHTML = subBreeds[key];
            subBreedOptions.appendChild(option);
        }
    }
}

// This is just a simple helper function that turns certain displays on and off.
function ToggleDisplay(displayMain) {
    if (displayMain) {
        content.style.display = "none";
        mainImage.style.display = "flex";
    }
    else {
        content.style.display = "flex";
        mainImage.style.display = "none";
    }
}
//#endregion
//#region Text Formatters
let specialCases = []
specialCases["Germanshepherd"] = "German Shepherd";

// Gets the first char and capitalizes it and adds it back to the rest of the string.
function CapitalizeName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function LinkToName(breed) {

    // Strips the link away.
    breed = breed.replace("https://images.dog.ceo/breeds/", "");
    breed = breed.substr(0, breed.search("/"));
    breed = breed.replace("/", "");
    breed = breed.replace("-", " ");

    // Splits the string in two so we can capitalize the breed and sub-breed.
    breed = breed.split(" ");
    let first = breed[0];
    let second = breed[1] || "";

    first = CapitalizeName(first)
    second = CapitalizeName(second)

    // Checks for special cases in which the api has an ugly name. Ex. Germanshepherd > German Shepherd
    let finalName = second + " " + first;
    if (specialCases[finalName]) {
        finalName = specialCases[finalName];
    }

    return finalName
}
//#endregion
//#region Display Functions
function CreateImage(src) {
    // Creates an image with src image.
    let image = document.createElement('img');
    image.src = src;
    image.alt = "dog";
    image.className = "circular";
    return image;
}
function CreateDisplayFromImages(imageArray) {
    // Removes all old content
    while (content.lastChild) {
        content.removeChild(content.lastChild);
    }
    for (let key in imageArray) {
        content.appendChild(CreateImage(imageArray[key]));
    }
}
function SetRandomImage(e) {

    let result = JSON.parse(e.target.responseText);
    if (result.message.length > 1) {

        // If we have more than one image we loop through the array and add images to the content div.
        ToggleDisplay(false);
        let images = result.message;
        CreateDisplayFromImages(images);

        // Because there are possibly multiple breeds we just title it random.
        dogBreed.innerHTML = "Random";
    }
    else {
        // If we just have one image we toggle the main display and grab the first index.
        ToggleDisplay(true);
        let breed = result.message[0];
        randomImage.src = breed;
        breed = LinkToName(breed);
        dogBreed.innerHTML = breed;
    }
}
function SetSpesificBreed(e) {
    let result = JSON.parse(e.target.responseText);
    if (result.message.length > 0) {
        ToggleDisplay(false);
        let images = result.message;
        CreateDisplayFromImages(images);
    }
    else {
        ToggleDisplay(true);
        randomImage.src = result.message;
    }

    let breed = CapitalizeName(breedOptions.value);
    if (subBreedOptions.value != "none") {
        breed = CapitalizeName(subBreedOptions.value) + " " + breed;
    }

    dogBreed.innerHTML = breed;
}
//#endregion
//#region Event Listeners
amountOptions.addEventListener("change", function name() {
    localStorage.setItem("stb6897_dogs_amount", amountOptions.value);
})
breedOptions.addEventListener("change", function name() {
    localStorage.setItem("stb6897_dogs_breed", breedOptions.value);
    SetSubBreeds();
})
randomButton.addEventListener("click", function RandomButton() {
    httpGetResult('https://dog.ceo/api/breeds/image/random/1', SetRandomImage);
})
searchButton.addEventListener("click", function SearchButton() {
    // If we have a breed selected we call our spesific breed function. If not we randomly grab an image.
    if (breedOptions.value != "none") {
        let breedName = breedOptions.value
        if (subBreedOptions.value != "none") {
            breedName = breedName + "/" + subBreedOptions.value;
        }
        if (amountOptions.value == 1) {
            httpGetResult('https://dog.ceo/api/breed/' + breedName + '/images/random/1', SetSpesificBreed);
        }
        else {
            httpGetResult('https://dog.ceo/api/breed/' + breedName + '/images/random/' + amountOptions.value, SetSpesificBreed);
        }
    }
    else {
        httpGetResult('https://dog.ceo/api/breeds/image/random/' + amountOptions.value, SetRandomImage);
    }
})
//#endregion
//#region On Page Load
let possibleBreed = localStorage.getItem("stb6897_dogs_breed");
let possibleAmount = localStorage.getItem("stb6897_dogs_amount")
if (possibleAmount) {
    amountOptions.value = possibleAmount;
}
httpGetResult('https://dog.ceo/api/breeds/list/all', SetBreeds);
httpGetResult('https://dog.ceo/api/breeds/image/random/1', SetRandomImage);
//#endregion