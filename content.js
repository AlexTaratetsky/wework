
var ADD_BTN_TEXT = "Add To Favorite";
var REMOVE_BTN_TEXT = "Remove From Favorite";

chrome.runtime.sendMessage({
    action: "getSource",
    source: document.documentElement.outerHTML,
    path: window.location.pathname
}, function responseCallback(response){
    setTimeout(function(){
        if(document.getElementsByClassName("my-btn").length == 0)
            addFavoriteButtons(JSON.parse(response.message));
    }, 1000);
    
});


function getNewButton(building){
    var newBtn = document.createElement("button");
    newBtn.className = "my-btn";
    newBtn.name = building.name;
    newBtn.url = building.url;
    if(building.exist){
        newBtn.innerHTML = REMOVE_BTN_TEXT;
        newBtn.style.backgroundColor = "red";
    }else{
        newBtn.innerHTML = ADD_BTN_TEXT;
        newBtn.style.backgroundColor = "green";
    }
    newBtn.style.width = "100%";
    newBtn.style.fontWeight = "bold";
    newBtn.addEventListener('click', favoriteButtonClicked, false);
    return newBtn;
}

function addFavoriteButtons(buildingsNameUrl){
    var buildingTitles = document.querySelectorAll("h2[type='title2']");
    for (buildingTitle of buildingTitles) {
        var building = getBuildingByName(buildingsNameUrl, buildingTitle.innerHTML); 
        var newBtn = getNewButton(building);
        var newDiv = document.createElement("div");
        newDiv.appendChild(newBtn);
        buildingTitle.parentNode.parentNode.appendChild(newDiv);
    }
}

function getBuildingByName(buildingsNameUrl, name){
    for(building of buildingsNameUrl){
        if(building.name.startsWith(name)){
            return building;
        }
    }
    console.log("ERROR: didn't found building with name: " + name);
}

function favoriteButtonClicked() {
    if(this.innerHTML == ADD_BTN_TEXT){
        this.innerHTML = REMOVE_BTN_TEXT;
        this.style.backgroundColor = "red";
    }else{
        this.innerHTML = ADD_BTN_TEXT;
        this.style.backgroundColor = "green";
    }
    chrome.runtime.sendMessage({
        action: "buttonClicked",
        name: this.name,
        url: this.url
        });
}