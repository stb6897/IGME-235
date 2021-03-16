

// Grabs results from site.
function httpGetResult(url, method) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url);
    xmlHttp.send();
    xmlHttp.onload = method
}
let breeds = new Array();
let options = document.getElementById('breed');
function GetBreeds(e) {
    breeds = JSON.parse(e.target.responseText).message;
    let options = document.getElementById('breed');
    for (let key in breeds) {
        console.log(breeds[key]);
        let option = document.createElement('option');
        option.value = key;
        option.innerHTML = key;

        options.appendChild(option);
    }
}
function GetRandomImage(e) {

    let result = JSON.parse(e.target.responseText);

    randomImage.src = result.message;
    let breed = result.message;
    breed = breed.replace("https://images.dog.ceo/breeds/", "");
    breed = breed.substr(0, breed.search("/"));
    breed = breed.replace("/", "");
    breed = breed.replace("-", " ");
    dogBreed.innerHTML = breed;
}


function GetSpesificBreed(e) {

    let result = JSON.parse(e.target.responseText);

    randomImage.src = result.message;
    let breed = result.message;

    dogBreed.innerHTML = options.value;
}

let randomImage = document.getElementById('randomizer_image');
let randomButton = document.getElementById('randomizer_button');
let searchButton = document.getElementById('search_button');
let dogBreed = document.getElementById('dogbreed');
httpGetResult('https://dog.ceo/api/breeds/list/all', GetBreeds)






randomButton.addEventListener("click", function name() {
    httpGetResult('https://dog.ceo/api/breeds/image/random', GetRandomImage);
})
searchButton.addEventListener("click", function name() {

    httpGetResult('https://dog.ceo/api/breed/' + options.value + '/images/random/1', GetSpesificBreed);
})
httpGetResult('https://dog.ceo/api/breeds/image/random', GetRandomImage);