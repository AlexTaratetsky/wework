
function addFavoriteButtons(){ 
    var buildingTitles = document.querySelectorAll("h2[type='title2']");
    for (buildingTitle of buildingTitles) {
        var newBtn = document.createElement("button");
        newBtn.name = buildingTitle.innerHTML;
        newBtn.className = buildingTitle.parentElement.lastChild.className;
        newBtn.innerHTML = "Add Favorite List";
        newBtn.addEventListener('click', favoriteButtonClicked, false);
        buildingTitle.parentElement.parentElement.appendChild(newBtn);
    }
}


