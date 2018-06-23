
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostEquals: 'www.wework.com'},
    })
    ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

const FAVORITE_KEY  = "FavoriteBuildingsKey";
const BASE_URL      = "https://www.wework.com";
const CITY_PART     = "/l/";

chrome.tabs.onUpdated.addListener(function ( tabId, changeInfo, tab ) {
    if (changeInfo.status === 'complete' && 
    tab.url.startsWith(BASE_URL) && 
    tab.url.includes(CITY_PART)) {
      chrome.tabs.executeScript({
			    file: "content.js"}, function () {
          if (chrome.runtime.lastError) {
            console.log("ERROR: " + chrome.runtime.lastError.message);
          }
		  });
	  }
});

class BuldingsUrlBuilder {
	constructor(html, cityPath) {
		this.cityPath = cityPath;
		this.ID_STR   = "window.__PAGE_DATA__";
		this.dom      = document.createElement('html');
    this.dom.innerHTML = html;
	}
	
	extractInfo() {
		var scriptTags = this.dom.getElementsByTagName('script');
		for (let i = 0; i < scriptTags.length; i++) {
			if (scriptTags[i].innerText.indexOf(this.ID_STR) != -1) {
        var text = scriptTags[i].innerText;
        var json = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
				return JSON.parse(json);
			}
		}
	}
	
	extractCityInfo(info) {
		var data = info.locations.geogroupings.data;
		for (let id in data) {
			if (this.cityPath.endsWith(data[id].path)) {
				return data[id];
			}
		}
	}
	
	extractCityBuildings(info, cityInfo) {
    let cityBuildings = [];
    let buildings = info.locations.buildings;
		cityInfo.buildings.forEach(function(id) {
      var btnName = buildings[id].name + " , " + cityInfo.name;
      cityBuildings.push({
        name: btnName, 
        url: BASE_URL + buildings[id].path,
        exist: isNameExistInDB(btnName)
      });
		});
		return cityBuildings
	}
	
	buildUrlArrAsString() {
		let info          = this.extractInfo();
		let cityInfo      = this.extractCityInfo(info);
    let buildingsPath = this.extractCityBuildings(info, cityInfo);
		return JSON.stringify(buildingsPath)
	}
}

function getBuildings(html, cityPath) {
  let urlBuilder = new BuldingsUrlBuilder(html, cityPath);
  return urlBuilder.buildUrlArrAsString();
}

function isNameExistInDB(name){
  if(localStorage.getItem(FAVORITE_KEY) === null){
    return false;
  }
  var favorite_buildings = JSON.parse(localStorage.getItem(FAVORITE_KEY));
  for(favBuilding of favorite_buildings){
    if(favBuilding.name == name){
      return true;
    }
  }
  return false;
}

function favoriteBtnClicked(name, url){
  var favBuilding = {name: name, url: url};
  var favorite_buildings = [];
  if(localStorage.getItem(FAVORITE_KEY) === null){
      favorite_buildings.push(favBuilding);
  }else{
      var isBuildingFound = false;
      favorite_buildings = JSON.parse(localStorage.getItem(FAVORITE_KEY));
      for (i = 0; i < favorite_buildings.length; i++) { 
          if(favorite_buildings[i].name === favBuilding.name){
              favorite_buildings.splice(i, 1);
              isBuildingFound = true;
              break;
          }
      }
      if(!isBuildingFound){
          favorite_buildings.push(favBuilding);
      }
  }
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorite_buildings));
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getSource") {
	  sendResponse({message: getBuildings(request.source, request.path)});
  }
  if (request.action === "buttonClicked") {
    favoriteBtnClicked(request.name, request.url);
  }
});
