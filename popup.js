const FAVORITE_KEY = "FavoriteBuildingsKey";

function favoriteButtonClicked(){
    chrome.tabs.create({url:this.url})
}

function addFavoritebuilding(name, url) {
    var favoriteList = document.getElementById("favoriteList");
    var newnode = document.createElement("li");
    var newbutton = document.createElement("button");
    newbutton.className = "button buttonbuilding";
    newbutton.innerHTML = name;
    newbutton.name = name;
    newbutton.url = url;
    newbutton.addEventListener('click', favoriteButtonClicked, false);
    newnode.appendChild(newbutton);
    favoriteList.appendChild(newnode);
}

function loadFavoriteList(){
    if(localStorage.getItem(FAVORITE_KEY) === null){
        return;
    }
    var favorite_buildings = JSON.parse(localStorage.getItem(FAVORITE_KEY));
    favorite_buildings.forEach(function(building) {
        addFavoritebuilding(building.name, building.url);
    });
}

loadFavoriteList();