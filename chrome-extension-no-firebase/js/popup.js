resetButtonClicked = () => {
    chrome.runtime.sendMessage({command: "reset"});
}

viewFullWebsiteButtonClicked = () => {
    chrome.tabs.create({url: '../html/Knolist.com.html'})
}

createListenerToListSitesVisited = (userId) => {
    console.log(firebase.database())
    var visitedSitesDatabase = firebase.database().ref('sitesVisited/' + userId);
    console.log(visitedSitesDatabase)
    visitedSitesDatabase.on('value', function (snapshot) {
      console.log(snapshot.val())
      websites = snapshot.val();
      websites = Object.values(websites);
      websites.forEach((url) => {
        const div = document.createElement('div');
        div.textContent = `${url}`;
        document.body.appendChild(div)
      });
    });
}

createListeners = () => {
    // Button Listeners
    document.getElementById('reset-button').addEventListener('click', resetButtonClicked, false);
    document.getElementById('full-website-button').addEventListener('click', viewFullWebsiteButtonClicked, false);
}

document.addEventListener('DOMContentLoaded', createListeners, false);
